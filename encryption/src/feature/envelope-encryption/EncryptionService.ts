import { ISymmetricKeyService } from "./ISymmetricKeyService.js";
import { createEnvelope, envelopeToBytes, parseEnvelope } from "./Envelope.js";
import {
  encryptAesGcm,
  decryptAesGcm,
  NONCE_SIZE,
  TAG_SIZE,
} from "../encryption-algorithm/AesAlgorithm.js";
import { bytesToBase64, fromBase64 } from "../../utils/stringUtils.js";

export interface IEncryptionService {
  encrypt(plainText: string): Promise<string>;
  decrypt(cipherText: string): Promise<string>;
}

export class EncryptionService implements IEncryptionService {
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
