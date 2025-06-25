import { ISymmetricKeyService } from "./ISymmetricKeyService.js";
import { SymmetricKeyPair } from "./SymmetricKeyPair.js";
import { createEnvelope, envelopeToBytes, parseEnvelope } from "./Envelope.js";
import {
  encryptAesGcm,
  decryptAesGcm,
  DATA_KEY_SIZE,
  NONCE_SIZE,
  TAG_SIZE,
} from "../encryption-algorithm/AesAlgorithm.js";
import { fromBase64 } from "../../utils/stringUtils.js";

const ENVELOP_VERSION = 1;

export interface EncryptionSettings {
  base64MasterKey: string;
}

export class EnvKeyService implements ISymmetricKeyService {
  private readonly masterKey: Uint8Array;

  constructor(settings: EncryptionSettings) {
    if (!settings || !settings.base64MasterKey) {
      throw new Error("EncryptionSettings.base64MasterKey is required");
    }
    this.masterKey = fromBase64(settings.base64MasterKey);
  }

  async getDataKey(): Promise<SymmetricKeyPair> {
    const dataKey = crypto.getRandomValues(new Uint8Array(DATA_KEY_SIZE));
    const nonce = crypto.getRandomValues(new Uint8Array(NONCE_SIZE));
    const tag = new Uint8Array(TAG_SIZE);
    const encryptedKey = new Uint8Array(DATA_KEY_SIZE);

    const encBytes = await encryptAesGcm({
      key: this.masterKey,
      data: dataKey,
      nonce,
      tagLength: TAG_SIZE * 8,
    });
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
      encryptedDataKey: envelopeToBytes(envelope),
    };
  }

  async decryptDataKey(ciphertext: Uint8Array): Promise<Uint8Array> {
    const envelope = parseEnvelope(ciphertext);
    if (envelope.version !== ENVELOP_VERSION) {
      throw new Error(`Unsupported Envelope version: ${envelope.version}`);
    }
    const encAndTag = new Uint8Array(
      envelope.encryptedKey.length + envelope.tag.length
    );
    encAndTag.set(envelope.encryptedKey, 0);
    encAndTag.set(envelope.tag, envelope.encryptedKey.length);
    const decrypted = await decryptAesGcm({
      key: this.masterKey,
      encrypted: encAndTag,
      nonce: envelope.nonce,
      tagLength: TAG_SIZE * 8,
    });
    return decrypted;
  }
}
