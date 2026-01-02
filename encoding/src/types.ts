export interface CommandPayload {
  id: string;
  name: string;
  age: number;
  tags: string[];
  address: {
    country: string;
    city: string;
    street: string;
    zip: number;
  };
  createdAt: number;
}

export interface BenchmarkResult {
  encodingTimeMs: number;
  decodingTimeMs: number;
  payloadBytes: number;
}

export interface PayloadEncoder {
  name: string;
  encode: (payload: CommandPayload) => Uint8Array;
  decode: (payload: Uint8Array) => CommandPayload;
  benchmark: (payload: CommandPayload, iterations?: number) => BenchmarkResult;
}
