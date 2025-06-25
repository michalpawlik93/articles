import { SymmetricKeyPair } from './SymmetricKeyPair.js'

export interface ISymmetricKeyService {
  getDataKey(): Promise<SymmetricKeyPair>;
  decryptDataKey(ciphertext: Uint8Array): Promise<Uint8Array>;
}
