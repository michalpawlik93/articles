export const DATA_KEY_SIZE = 32;
export const NONCE_SIZE = 12;
export const TAG_SIZE = 16;

export async function encryptAesGcm({
  key,
  data,
  nonce,
  tagLength = TAG_SIZE * 8,
}: {
  key: Uint8Array;
  data: Uint8Array;
  nonce: Uint8Array;
  tagLength?: number;
}): Promise<Uint8Array> {
  const aesKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
  const encResult = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce, tagLength },
    aesKey,
    data
  );
  return new Uint8Array(encResult);
}

export async function decryptAesGcm({
  key,
  encrypted,
  nonce,
  tagLength = TAG_SIZE * 8,
}: {
  key: Uint8Array;
  encrypted: Uint8Array;
  nonce: Uint8Array;
  tagLength?: number;
}): Promise<Uint8Array> {
  const aesKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce, tagLength },
    aesKey,
    encrypted
  );
  return new Uint8Array(decrypted);
}
