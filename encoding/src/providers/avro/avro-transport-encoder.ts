import type { BenchmarkResult, TransportEncoder } from '../../types.js';
import { runBenchmark } from '../../shared/benchmark.js';

const u32be = (value: number): Buffer => {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0, 0);
  return buffer;
};

const readU32be = (payload: Uint8Array): { schemaId: number; payload: Uint8Array } => {
  const buffer = Buffer.from(payload);
  if (buffer.length < 4) {
    throw new Error('Invalid Avro transport payload');
  }
  return { schemaId: buffer.readUInt32BE(0), payload: buffer.subarray(4) };
};

export const AvroTransportEncoder = (
  schemaRef = 1234,
): TransportEncoder => {
  const encode = (payload: Uint8Array): Uint8Array => {
    return Buffer.concat([u32be(schemaRef), Buffer.from(payload)]);
  };

  const decode = (payload: Uint8Array): Uint8Array => {
    const { schemaId, payload: decodedPayload } = readU32be(payload);
    if (schemaId !== schemaRef) {
      throw new Error('Schema ref mismatch');
    }
    return decodedPayload;
  };

  const benchmark = (payload: Uint8Array, iterations = 1000): BenchmarkResult => {
    return runBenchmark(payload, encode, decode, iterations);
  };

  return {
    name: 'Avro transport',
    encode,
    decode,
    benchmark,
  };
};
