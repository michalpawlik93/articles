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

```JavaScript
interface Envelope {
  version: number;
  encryptedKey: Uint8Array;
  nonce: Uint8Array;
  tag: Uint8Array;
  cipherText: Uint8Array;
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

```JavaScript
interface ISymmetricKeyService {
  getDataKey(): Promise<SymmetricKeyPair>;
  decryptDataKey(ciphertext: Uint8Array): Promise<Uint8Array>;
}

interface SymmetricKeyPair {
  encryptedDataKey: Uint8Array;
  decryptedDataKey: Uint8Array;
}
```

Component 3: Encryption Service

Encryption service contains business logic to encrypt/decrypt data and create Envelope object. There you put your encryption algorithm.

```JavaScript
class EncryptionService implements IEncryptionService {
  private readonly symmetricKeyService: ISymmetricKeyService;
  private static readonly ENVELOP_VERSION = 1;

  constructor(symmetricKeyService: ISymmetricKeyService) {
    if (!symmetricKeyService)
      throw new Error("symmetricKeyService is required");
    this.symmetricKeyService = symmetricKeyService;
  }

  private static isEncrypted(input: string): boolean {
    try {
      parseEnvelope(fromBase64(input));
      return true;
    } catch {
      return false;
    }
  }

  async encrypt(plainText: string): Promise<string> {
    if (EncryptionService.isEncrypted(plainText)) {
      throw new Error("The input text is already encrypted.");
    }
    const plaintextBytes = new TextEncoder().encode(plainText);
    const keyPair = await this.symmetricKeyService.getDataKey();
    const dek = keyPair.decryptedDataKey;
    const nonce = crypto.getRandomValues(new Uint8Array(NONCE_SIZE));
    const tagLength = TAG_SIZE;
    const encBytes = await encryptAesGcm({
      key: dek,
      data: plaintextBytes,
      nonce,
      tagLength: tagLength * 8,
    });
    const cipherText = encBytes.slice(0, plaintextBytes.length);
    const tag = encBytes.slice(
      plaintextBytes.length,
      plaintextBytes.length + tagLength
    );
    const dataEnvelope = createEnvelope(
      EncryptionService.ENVELOP_VERSION,
      keyPair.encryptedDataKey,
      nonce,
      tag,
      cipherText
    );
    return bytesToBase64(envelopeToBytes(dataEnvelope));
  }

  async decrypt(cipherText: string): Promise<string> {
    const envelopeBytes = fromBase64(cipherText);
    const envelope = parseEnvelope(envelopeBytes);
    const dek = await this.symmetricKeyService.decryptDataKey(
      envelope.encryptedKey
    );
    const encAndTag = new Uint8Array(
      envelope.cipherText.length + envelope.tag.length
    );
    encAndTag.set(envelope.cipherText, 0);
    encAndTag.set(envelope.tag, envelope.cipherText.length);
    const decrypted = await decryptAesGcm({
      key: dek,
      encrypted: encAndTag,
      nonce: envelope.nonce,
      tagLength: envelope.tag.length * 8,
    });
    return new TextDecoder().decode(decrypted);
  }
}
```

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
https://github.com/michalpawlik93/articles/tree/main/encryption
