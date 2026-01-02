import type { BenchmarkResult, CommandPayload, PayloadEncoder } from '../../types.js';
import { runBenchmark } from '../../shared/benchmark.js';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

const builder = new XMLBuilder({
  ignoreAttributes: false,
  format: false,
});

const parser = new XMLParser({
  ignoreAttributes: false,
});

export const XmlEncoder = (): PayloadEncoder => {
  const encode = (payload: CommandPayload): Uint8Array => {
    const xml = builder.build({ CommandPayload: payload });
    return Buffer.from(xml, 'utf8');
  };

  const decode = (payload: Uint8Array): CommandPayload => {
    const xml = Buffer.from(payload).toString('utf8');
    const parsed = parser.parse(xml);
    return parsed.CommandPayload as CommandPayload;
  };

  const benchmark = (payload: CommandPayload, iterations = 1000): BenchmarkResult => {
    return runBenchmark(payload, encode, decode, iterations);
  };

  return {
    name: 'XML',
    encode,
    decode,
    benchmark,
  };
};
