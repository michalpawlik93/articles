import { AvroEncoder } from './providers/avro/avro-payload-encoder.js';
import { AvroTransportEncoder } from './providers/avro/avro-transport-encoder.js';
import { GrpcTransportEncoder } from './providers/grpc/grpc-transport-encoder.js';
import { ProtobufEncoder } from './providers/grpc/protobuf-encoder.js';
import { JsonEncoder } from './providers/json/json-encoder.js';
import { samplePayload } from './test-data/test-command.js';

async function main() {
  const payloadEncoders = [JsonEncoder(), AvroEncoder(), ProtobufEncoder()];
  const iterations = 1000;

  const payloadResults = payloadEncoders.map((encoder) => {
    const encoded = encoder.encode(samplePayload);
    const decoded = encoder.decode(encoded);

    if (JSON.stringify(decoded) !== JSON.stringify(samplePayload)) {
      throw new Error(`${encoder.name}: payload mismatch after decode`);
    }

    const bench = encoder.benchmark(samplePayload, iterations);
    return {
      format: encoder.name,
      payloadBytes: bench.payloadBytes,
      encodeMs: Number(bench.encodingTimeMs.toFixed(3)),
      decodeMs: Number(bench.decodingTimeMs.toFixed(3)),
    };
  });

  console.log(`Iterations: ${iterations}`);
  console.table(payloadResults);

  const avroPayload = payloadEncoders[1].encode(samplePayload);
  const protobufPayload = payloadEncoders[2].encode(samplePayload);

  const transportEncoders = [
    { encoder: AvroTransportEncoder(), payload: avroPayload, decoder: payloadEncoders[1] },
    { encoder: GrpcTransportEncoder(), payload: protobufPayload, decoder: payloadEncoders[2] },
  ];

  const transportResults = transportEncoders.map(({ encoder, payload, decoder }) => {
    const encoded = encoder.encode(payload);
    const decodedPayload = encoder.decode(encoded);
    const decodedMessage = decoder.decode(decodedPayload);

    if (JSON.stringify(decodedMessage) !== JSON.stringify(samplePayload)) {
      throw new Error(`${encoder.name}: payload mismatch after transport decode`);
    }

    const bench = encoder.benchmark(payload, iterations);
    return {
      format: encoder.name,
      payloadBytes: bench.payloadBytes,
      encodeMs: Number(bench.encodingTimeMs.toFixed(3)),
      decodeMs: Number(bench.decodingTimeMs.toFixed(3)),
    };
  });

  console.table(transportResults);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
