export interface SymmetricKeyPair {
  encryptedDataKey: Uint8Array;
  decryptedDataKey: Uint8Array;
}

export function createSymmetricKeyPair(
  encryptedDataKey: Uint8Array,
  decryptedDataKey: Uint8Array
): SymmetricKeyPair {
  return { encryptedDataKey, decryptedDataKey };
}
