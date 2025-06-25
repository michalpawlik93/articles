const HEADER = new Uint8Array([0x45, 0x4E, 0x56]);
const NONCE_SIZE = 12; 
const TAG_SIZE = 16; 

export interface Envelope {
  version: number;
  encryptedKey: Uint8Array;
  nonce: Uint8Array;
  tag: Uint8Array;
  cipherText: Uint8Array;
}

export function createEnvelope(
  version: number,
  encryptedKey: Uint8Array,
  nonce: Uint8Array,
  tag: Uint8Array,
  cipherText: Uint8Array
): Envelope {
  return { version, encryptedKey, nonce, tag, cipherText };
}

export function envelopeToBytes(env: Envelope): Uint8Array {
  const { version, encryptedKey, nonce, tag, cipherText } = env;
  const result = new Uint8Array(
    HEADER.length + 1 + 1 + encryptedKey.length + nonce.length + tag.length + cipherText.length
  );
  let offset = 0;
  result.set(HEADER, offset); offset += HEADER.length;
  result[offset++] = version;
  result[offset++] = encryptedKey.length;
  result.set(encryptedKey, offset); offset += encryptedKey.length;
  result.set(nonce, offset); offset += nonce.length;
  result.set(tag, offset); offset += tag.length;
  result.set(cipherText, offset);
  return result;
}

export function parseEnvelope(data: Uint8Array): Envelope {
  let offset = 0;
  if (data.length < HEADER.length + 1 + 1) {
    throw new Error('Invalid Envelope: too short');
  }
  const header = data.slice(offset, offset + HEADER.length);
  if (!header.every((v, i) => v === HEADER[i])) {
    throw new Error('Invalid Envelope: missing or corrupted header');
  }
  offset += HEADER.length;
  const version = data[offset++];
  const keyLength = data[offset++];
  if (keyLength < 1) {
    throw new Error('Invalid Envelope: key length missing or zero');
  }
  if (data.length < offset + keyLength + NONCE_SIZE + TAG_SIZE) {
    throw new Error('Invalid Envelope: not enough data');
  }
  const encryptedKey = data.slice(offset, offset + keyLength); offset += keyLength;
  const nonce = data.slice(offset, offset + NONCE_SIZE); offset += NONCE_SIZE;
  const tag = data.slice(offset, offset + TAG_SIZE); offset += TAG_SIZE;
  const cipherText = data.slice(offset);
  return { version, encryptedKey, nonce, tag, cipherText };
}
