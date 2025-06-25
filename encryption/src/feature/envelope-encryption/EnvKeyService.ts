import { ISymmetricKeyService } from './ISymmetricKeyService.js';
import { SymmetricKeyPair } from './SymmetricKeyPair.js';
import {createEnvelope, envelopeToBytes, parseEnvelope } from './Envelope.js';

const ENVELOP_VERSION = 1;
const DATA_KEY_SIZE = 32;
const NONCE_SIZE = 12;
const TAG_SIZE = 16;

export interface EncryptionSettings {
  base64MasterKey: string;
}

export class EnvKeyService implements ISymmetricKeyService {
  private readonly masterKey: Uint8Array;

  constructor(settings: EncryptionSettings) {
    if (!settings || !settings.base64MasterKey) {
      throw new Error('EncryptionSettings.base64MasterKey is required');
    }
    this.masterKey = fromBase64(settings.base64MasterKey);
  }

  async getDataKey(): Promise<SymmetricKeyPair> {
    const dataKey = crypto.getRandomValues(new Uint8Array(DATA_KEY_SIZE));
    const nonce = crypto.getRandomValues(new Uint8Array(NONCE_SIZE));
    const tag = new Uint8Array(TAG_SIZE);
    const encryptedKey = new Uint8Array(DATA_KEY_SIZE);

    const aesKey = await crypto.subtle.importKey(
      'raw',
      this.masterKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
    const encResult = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce, tagLength: TAG_SIZE * 8 },
      aesKey,
      dataKey
    );
    const encBytes = new Uint8Array(encResult);
    encryptedKey.set(encBytes.slice(0, DATA_KEY_SIZE));
    tag.set(encBytes.slice(DATA_KEY_SIZE, DATA_KEY_SIZE + TAG_SIZE));

    const envelope = createEnvelope(
      ENVELOP_VERSION,
      encryptedKey,
      nonce,
      tag,
      new Uint8Array(0)
    );
    return {
      decryptedDataKey: dataKey,
      encryptedDataKey: envelopeToBytes(envelope)
    };
  }

  async decryptDataKey(ciphertext: Uint8Array): Promise<Uint8Array> {
    const envelope = parseEnvelope(ciphertext);
    if (envelope.version !== ENVELOP_VERSION) {
      throw new Error(`Unsupported Envelope version: ${envelope.version}`);
    }
    const aesKey = await crypto.subtle.importKey(
      'raw',
      this.masterKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
    const encAndTag = new Uint8Array(envelope.encryptedKey.length + envelope.tag.length);
    encAndTag.set(envelope.encryptedKey, 0);
    encAndTag.set(envelope.tag, envelope.encryptedKey.length);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: envelope.nonce, tagLength: TAG_SIZE * 8 },
      aesKey,
      encAndTag
    );
    return new Uint8Array(decrypted);
  }
}

function fromBase64(b64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(b64, 'base64'));
  }
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; ++i) arr[i] = bin.charCodeAt(i);
  return arr;
}
