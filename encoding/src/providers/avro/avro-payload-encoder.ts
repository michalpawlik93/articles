import avro, { type Schema } from 'avsc';
import type { BenchmarkResult, CommandPayload, PayloadEncoder } from '../../types.js';
import { runBenchmark } from '../../shared/benchmark.js';
import { commandPayloadSchema } from './schema.js';

const avroType = avro.Type.forSchema(commandPayloadSchema as Schema);

export const AvroEncoder = (): PayloadEncoder => {
  const encode = (payload: CommandPayload): Uint8Array => {
    return avroType.toBuffer(payload);
  };

  const decode = (payload: Uint8Array): CommandPayload => {
    return avroType.fromBuffer(Buffer.from(payload)) as CommandPayload;
  };

  const benchmark = (payload: CommandPayload, iterations = 1000): BenchmarkResult => {
    return runBenchmark(payload, encode, decode, iterations);
  };

  return {
    name: 'Avro',
    encode,
    decode,
    benchmark,
  };
};
