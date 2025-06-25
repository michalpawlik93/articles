## Envelope Encryption

What is for?
Envelope encryption offers a robust method for encrypting your data. In traditional symmetric encryption, data is often encrypted using a single data key. This approach presents several points of failure:

- Inability to easily rotate encryption keys: Changing the key used for encryption is complex.
- Difficult migrations: Migrating encrypted data to new keys or systems becomes challenging.
- Widespread compromise: If the single encryption key is compromised, it could lead to the compromise of all your encrypted data.

All of these issues can be avoided with envelope encryption. In envelope encryption, there is a pair of keys. One is the master key, and the second is a generated one called the data key. The master key is used to encrypt the data key, ensuring it is not stored as plain text.

The database now stores not only encrypted data but also the encrypted data key and factors needed to decrypt it. This pattern offers several advantages:

- Compromising the master key does not compromise all of your data.
- Key rotation is easier to manage.
- Data migration is simpler.

## How can we implement it in C#?

Component 1: Envelope

The domain layer and the heart of this concept is the Envelope. An Envelope is a kind of wrapping function that consists of all factors needed to effectively encrypt data. Instead of storing a plain text secret, we want to store the Envelope in an encoded form. Thanks to the Envelope's schema, we can recreate its properties from a Base64 text string.

```c#
public sealed record Envelope(
	byte[] EncryptedKey,
	byte[] CipherText)
{
	public byte[] ToBytes() {
		using var ms = new MemoryStream();
		ms.WriteByte((byte)EncryptedKey.Length);
		ms.Write(EncryptedKey);
		ms.Write(CipherText);
		return ms.ToArray();
	}

	public static Envelope Parse(byte[] data) {
		using var ms = new MemoryStream(data);
		var keyLength = ms.ReadByte();
		if (keyLength < 1)
			throw new InvalidDataException("Invalid Envelope: key length missing");

		var encryptedKey = ms.ReadBytes(keyLength);
		var remaining = ms.Length - ms.Position;
		var cipherText = ms.ReadBytes((int)remaining);

		return new Envelope(encryptedKey, cipherText);
	}
}
```

The most important properties are CipherText and EncryptedKey.
CipherText is the encrypted data itself, for instance, a secret or a password.
EncryptedKey is the encrypted data key. The data key is encrypted using the Master Key.
If you are using an algorithm that requires additional factors, such as Nonce, you should store them as properties within the Envelope object.

Component 2: Key Service

The Key Service is used to obtain the DataKey, which will then be stored in the Envelope. The best practice is to utilize third-party providers like Azure Key Vault or KMS, but for basic use cases, you can generate your keys directly in C# code.

ISymmetricKeyService is an interface representing two methods. If you are using Azure Key Vault, you would create an AzureSymmetricKeyService class that implements ISymmetricKeyService, and so on.

SymmetricKeyPair is a class representing the DecryptedDataKey, which you can generate randomly or retrieve from a third-party service. EncryptedDataKey is the data key encrypted with your Master Key.

```c#
public interface ISymmetricKeyService
{
	Task<SymmetricKeyPair> GetDataKey(CancellationToken cancellationToken);
	Task<MemoryStream> DecryptDataKey(byte[] ciphertext, CancellationToken cancellationToken);
}

public record SymmetricKeyPair(MemoryStream EncryptedDataKey, MemoryStream DecryptedDataKey);
```

Component 3: Encryption Service

Encryption service contains business logic to encrypt/decrypt data and create Envelope object. There you put your encryption algorithm.

```c#
using System.Security.Cryptography;
using System.Text;

namespace Creatio.Embedded.Core.Features.Encryption;

public interface IEncryptionService
{
	Task<string> Encrypt(string plainText);
	Task<string> Decrypt(string cipherText);
}

public class EncryptionService : IEncryptionService
{
	private readonly ISymmetricKeyService _symmetricKeyService;

	public EncryptionService(ISymmetricKeyService symmetricKeyService) {
		ArgumentNullException.ThrowIfNull(symmetricKeyService, nameof(symmetricKeyService));
		_symmetricKeyService = symmetricKeyService;
	}

	public async Task<string> Encrypt(string plainText) {
		var plaintextBytes = Encoding.UTF8.GetBytes(plainText);

		var keyPair = await _symmetricKeyService
			.GetDataKey(CancellationToken.None);

		var dek = keyPair.DecryptedDataKey.ToArray();
		var cipherText = new byte[plaintextBytes.Length];


	// TODO: Implement encryption using your preferred algorithm (e.g., AES, RSA, ChaCha20)
	// var cipherText = YourEncryptionFunction(plaintextBytes, dek);

		var dataEnvelop = new Envelope(
			EncryptedKey: keyPair.EncryptedDataKey.ToArray(),
			CipherText: cipherText
		);

		return Convert.ToBase64String(dataEnvelop.ToBytes());
	}

	public async Task<string> Decrypt(string cipherText) {
		var envelopeBytes = Convert.FromBase64String(cipherText);
		var envelop = Envelope.Parse(envelopeBytes);

		var dekStream = await _symmetricKeyService
			.DecryptDataKey(envelop.EncryptedKey, CancellationToken.None);

		var dek = dekStream.ToArray();
		var plaintext = new byte[envelop.CipherText.Length];

	// TODO: Implement encryption using your preferred algorithm (e.g., AES, RSA, ChaCha20)
	// var cipherText = YourDecryptionFunction(plaintextBytes, dek);

		return Encoding.UTF8.GetString(plaintext);
	}
}
```
Note:
This implementation does not impose a specific encryption algorithm (like AES or RSA). You are expected to implement encryption and decryption logic depending on your use case, performance/security requirements, and available libraries. The Encrypt and Decrypt methods in the EncryptionService are intentionally left with placeholders.

Summary:

If you have the capacity to implement envelope encryption, it is a highly recommended approach by cloud providers like AWS and Azure.

This approach comes with both advantages and disadvantages. Let's reiterate some of them:

Advantages:

- Data key rotation is possible.
- A compromised Data Encryption Key (DEK) does not compromise all your data.
- Easier migrations to implement.
- You can easily check if data is already encrypted.

Disadvantages:

- The Envelope object (or its representation) has to be stored. This requires more disk space in your database.
- Encrypting and decrypting data requires more CPU resources.

Full implementation you can find in github repo of PlugAI Team.
https://github.com/CreatioRnDHub/Outlook.AI.Embedded/tree/hardcore-dev/src/Creatio.Embedded.Core/Features/Encryption
