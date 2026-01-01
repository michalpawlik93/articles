import type { BenchmarkResult, CommandPayload, PayloadEncoder } from '../../types.js';
import { runBenchmark } from '../../shared/benchmark.js';
import type { JsonPayload } from './schema.js';

export const JsonEncoder = (): PayloadEncoder => {
  const encode = (payload: CommandPayload): Uint8Array => {
    const jsonPayload: JsonPayload = payload;
    return Buffer.from(JSON.stringify(jsonPayload), 'utf8');
  };

  const decode = (payload: Uint8Array): CommandPayload => {
    return JSON.parse(Buffer.from(payload).toString('utf8')) as CommandPayload;
  };

  const benchmark = (payload: CommandPayload, iterations = 1000): BenchmarkResult => {
    return runBenchmark(payload, encode, decode, iterations);
  };

  return {
    name: 'JSON',
    encode,
    decode,
    benchmark,
  };
};
