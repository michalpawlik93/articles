import type { BenchmarkResult, CommandPayload, PayloadEncoder } from '../../types.js';
import { runBenchmark } from '../../shared/benchmark.js';
import { Address } from './gen-ts/bus/v1/Address.js';
import { CommandPayload as ThriftCommandPayload } from './gen-ts/bus/v1/CommandPayload.js';
import { createThriftDeserializer, createThriftSerializer } from './thrift-serializer.js';

const normalizeI64 = (value: unknown): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (value && typeof (value as { toNumber?: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value ?? 0);
};

const serializer = createThriftSerializer();
const deserializer = createThriftDeserializer();

export const ThriftEncoder = (): PayloadEncoder => {
  const encodeMessage = new ThriftCommandPayload();
  const encodeAddress = new Address();
  const decodeMessage = new ThriftCommandPayload();

  const encode = (payload: CommandPayload): Uint8Array => {
    encodeMessage.id = payload.id;
    encodeMessage.name = payload.name;
    encodeMessage.age = payload.age;
    encodeMessage.tags = payload.tags;
    encodeAddress.country = payload.address.country;
    encodeAddress.city = payload.address.city;
    encodeAddress.street = payload.address.street;
    encodeAddress.zip = payload.address.zip;
    encodeMessage.address = encodeAddress;
    encodeMessage.createdAt = payload.createdAt as unknown as ThriftCommandPayload['createdAt'];
    return serializer.serialize(encodeMessage);
  };

  const decode = (payload: Uint8Array): CommandPayload => {
    deserializer.deserialize(decodeMessage, Buffer.from(payload));

    const address = decodeMessage.address;
    return {
      id: decodeMessage.id ?? '',
      name: decodeMessage.name ?? '',
      age: decodeMessage.age ?? 0,
      tags: decodeMessage.tags ?? [],
      address: {
        country: address?.country ?? '',
        city: address?.city ?? '',
        street: address?.street ?? '',
        zip: address?.zip ?? 0,
      },
      createdAt: normalizeI64(decodeMessage.createdAt),
    };
  };

  const benchmark = (payload: CommandPayload, iterations = 1000): BenchmarkResult => {
    return runBenchmark(payload, encode, decode, iterations);
  };

  return {
    name: 'Thrift',
    encode,
    decode,
    benchmark,
  };
};
