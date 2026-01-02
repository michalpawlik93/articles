# Encoding Benchmark

This project compares payload size and encode/decode time for data formats:

- JSON (UTF-8, self-describing)
- Avro (binary, schema-based)
- Protobuf (binary, schema-based)
- Thrift (binary, schema-based)
- XML (text, schema-less)

The benchmark uses the same domain object across all formats and runs 1000 iterations.

The goal is to show:

- differences in payload size,
- the impact of encoding format on performance.

Notes:
- Results include library/runtime overhead and in-process IO (no network).
- Thrift results use the official thrift JS library, which performs many small protocol/transport writes and object allocations. A hand-optimized, domain-specific binary encoder (or a lower-level implementation) can be significantly faster.

## Run

```sh
npm start
```

The benchmark prints tables comparing payload size and encode/decode times.
