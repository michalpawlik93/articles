# Encoding & Transport Benchmark

This project compares payload size and encode/decode time for three data formats:

- JSON (UTF-8, self-describing)
- Avro (binary, schema-based)
- Protobuf (binary, schema-based)

The benchmark uses the same domain object across all formats and runs 1000 iterations.

Additionally, it compares the real transport cost:

- Avro transport: Avro payload with a lightweight schema reference envelope
- gRPC transport: Protobuf payload with gRPC framing (+5 bytes)

The goal is to show:

- differences in payload size,
- the impact of encoding format on performance,
- overhead introduced by the transport layer.

Notes:
- The transport decode includes the payload decode (gRPC transport includes Protobuf decode, Avro transport includes Avro decode).
- Results include library/runtime overhead and in-process IO (no network).
- The gRPC framing measured here is the minimal 5-byte message frame without HTTP/2 headers, flow control, or network costs.

## Run

```sh
npm start
```

The benchmark prints tables comparing payload size and encode/decode times.
