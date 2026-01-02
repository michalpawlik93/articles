import { AvroEncoder } from './providers/avro/avro-payload-encoder.js';
import { ProtobufEncoder } from './providers/grpc/protobuf-encoder.js';
import { JsonEncoder } from './providers/json/json-encoder.js';
import { ThriftEncoder } from './providers/thrift/thrift-encoder.js';
import { XmlEncoder } from './providers/xml/xml-encoder.js';
import { samplePayload } from './test-data/test-command.js';

async function main() {
  const payloadEncoders = [
    JsonEncoder(),
    AvroEncoder(),
    ProtobufEncoder(),
    ThriftEncoder(),
    XmlEncoder(),
  ];
  const iterations = 1000;

  const payloadResults = payloadEncoders.map((encoder) => {
    const encoded = encoder.encode(samplePayload);
    const decoded = encoder.decode(encoded);

    if (JSON.stringify(decoded) !== JSON.stringify(samplePayload)) {
      throw new Error(`${encoder.name}: payload mismatch after decode`);
    }

    const bench = encoder.benchmark(samplePayload, iterations);
    return {
      format: encoder.name === 'Thrift' ? `${encoder.name}*` : encoder.name,
      payloadBytes: bench.payloadBytes,
      encodeMs: Number(bench.encodingTimeMs.toFixed(3)),
      decodeMs: Number(bench.decodingTimeMs.toFixed(3)),
    };
  });

  console.log(`Iterations: ${iterations}`);
  console.table(payloadResults);
  console.log(
    '* Thrift results use the official thrift JS library, which performs many small protocol/transport writes and object allocations. A hand-optimized, domain-specific binary encoder (or a lower-level implementation) can be significantly faster.',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
