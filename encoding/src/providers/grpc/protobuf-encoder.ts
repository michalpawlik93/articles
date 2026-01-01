import path from 'node:path';
import protobuf from 'protobufjs';
import type { BenchmarkResult, CommandPayload, PayloadEncoder } from '../../types.js';
import { runBenchmark } from '../../shared/benchmark.js';

const loadPayloadType = (): protobuf.Type => {
  const protoPath = path.resolve(
    process.cwd(),
    'src/providers/grpc/schema.proto',
  );
  const root = protobuf.loadSync(protoPath);
  const type = root.lookupType('bus.v1.CommandPayload');
  if (!(type instanceof protobuf.Type)) {
    throw new Error('CommandPayload type not found in proto');
  }
  return type;
};

export const ProtobufEncoder = (): PayloadEncoder => {
  const payloadType = loadPayloadType();

  const encode = (payload: CommandPayload): Uint8Array => {
    const err = payloadType.verify(payload);
    if (err) {
      throw new Error(err);
    }
    return payloadType.encode(payloadType.create(payload)).finish();
  };

  const decode = (payload: Uint8Array): CommandPayload => {
    const message = payloadType.decode(payload);
    return payloadType.toObject(message, { longs: Number }) as CommandPayload;
  };

  const benchmark = (payload: CommandPayload, iterations = 1000): BenchmarkResult => {
    return runBenchmark(payload, encode, decode, iterations);
  };

  return {
    name: 'Protobuf',
    encode,
    decode,
    benchmark,
  };
};
