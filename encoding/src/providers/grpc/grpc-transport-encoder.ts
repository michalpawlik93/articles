import type { BenchmarkResult, TransportEncoder } from '../../types.js';
import { runBenchmark } from '../../shared/benchmark.js';

const grpcFrame = (messageBytes: Uint8Array): Buffer => {
  const payload = Buffer.from(messageBytes);
  const header = Buffer.alloc(5);
  header.writeUInt8(0, 0);
  header.writeUInt32BE(payload.length, 1);
  return Buffer.concat([header, payload]);
};

const grpcUnframe = (framed: Uint8Array): Buffer => {
  const buffer = Buffer.from(framed);
  if (buffer.length < 5) {
    throw new Error('Invalid gRPC frame');
  }
  if (buffer[0] !== 0) {
    throw new Error('Unsupported gRPC compression flag');
  }
  const declaredLength = buffer.readUInt32BE(1);
  const payload = buffer.subarray(5);
  if (declaredLength !== payload.length) {
    throw new Error('gRPC frame length mismatch');
  }
  return payload;
};

export const GrpcTransportEncoder = (): TransportEncoder => {
  const encode = (payload: Uint8Array): Uint8Array => grpcFrame(payload);

  const decode = (payload: Uint8Array): Uint8Array => grpcUnframe(payload);

  const benchmark = (payload: Uint8Array, iterations = 1000): BenchmarkResult => {
    return runBenchmark(payload, encode, decode, iterations);
  };

  return {
    name: 'gRPC transport',
    encode,
    decode,
    benchmark,
  };
};
