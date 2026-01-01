import type { BenchmarkResult } from '../types.js';

const nowMs = (): number => Number(process.hrtime.bigint()) / 1_000_000;

export const runBenchmark = <TInput, TOutput>(
  input: TInput,
  encode: (value: TInput) => Uint8Array,
  decode: (payload: Uint8Array) => TOutput,
  iterations = 1000,
): BenchmarkResult => {
  const startEncode = nowMs();
  let encoded: Uint8Array = Buffer.alloc(0);
  for (let i = 0; i < iterations; i += 1) {
    encoded = encode(input);
  }
  const endEncode = nowMs();

  const startDecode = nowMs();
  for (let i = 0; i < iterations; i += 1) {
    decode(encoded);
  }
  const endDecode = nowMs();

  return {
    encodingTimeMs: endEncode - startEncode,
    decodingTimeMs: endDecode - startDecode,
    payloadBytes: encoded.length,
  };
};
