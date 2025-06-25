import { ISymmetricKeyService } from './ISymmetricKeyService.js';
import { createEnvelope, envelopeToBytes, parseEnvelope } from './Envelope.js';

export interface IEncryptionService {
  encrypt(plainText: string): Promise<string>;
  decrypt(cipherText: string): Promise<string>;
}

export class EncryptionService implements IEncryptionService {
  private readonly symmetricKeyService: ISymmetricKeyService;
  private static readonly ENVELOP_VERSION = 1;

  constructor(symmetricKeyService: ISymmetricKeyService) {
    if (!symmetricKeyService) throw new Error('symmetricKeyService is required');
    this.symmetricKeyService = symmetricKeyService;
  }

  private static isEncrypted(input: string): boolean {
    try {
      parseEnvelope(base64ToBytes(input));
      return true;
    } catch {
      return false;
    }
  }

  async encrypt(plainText: string): Promise<string> {
    if (EncryptionService.isEncrypted(plainText)) {
      throw new Error('The input text is already encrypted.');
    }
    const plaintextBytes = new TextEncoder().encode(plainText);
    const keyPair = await this.symmetricKeyService.getDataKey();
    const dek = keyPair.decryptedDataKey;
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const tagLength = 16;
    const aesKey = await crypto.subtle.importKey(
      'raw', dek, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']
    );
    const encResult = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce, tagLength: tagLength * 8 },
      aesKey,
      plaintextBytes
    );
    const encBytes = new Uint8Array(encResult);
    const cipherText = encBytes.slice(0, plaintextBytes.length);
    const tag = encBytes.slice(plaintextBytes.length, plaintextBytes.length + tagLength);
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
    const envelopeBytes = base64ToBytes(cipherText);
    const envelope = parseEnvelope(envelopeBytes);
    const dek = await this.symmetricKeyService.decryptDataKey(envelope.encryptedKey);
    const aesKey = await crypto.subtle.importKey(
      'raw', dek, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']
    );
    const encAndTag = new Uint8Array(envelope.cipherText.length + envelope.tag.length);
    encAndTag.set(envelope.cipherText, 0);
    encAndTag.set(envelope.tag, envelope.cipherText.length);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: envelope.nonce, tagLength: envelope.tag.length * 8 },
      aesKey,
      encAndTag
    );
    return new TextDecoder().decode(decrypted);
  }
}

function base64ToBytes(b64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(b64, 'base64'));
  }
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; ++i) arr[i] = bin.charCodeAt(i);
  return arr;
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let bin = '';
  for (let i = 0; i < bytes.length; ++i) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
