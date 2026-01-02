import * as thrift from 'thrift';

type ProtocolFactory = {
  create: (transport: thrift.TTransport) => thrift.TProtocol;
};

const createBinaryProtocolFactory = (): ProtocolFactory => ({
  create: (transport) => new thrift.TBinaryProtocol(transport),
});

export const createThriftSerializer = (factory = createBinaryProtocolFactory()) => {
  const transport = new thrift.TBufferedTransport();
  const protocol = factory.create(transport);

  const serialize = (message: { write: (output: thrift.TProtocol) => void }): Uint8Array => {
    let output: Buffer = Buffer.alloc(0);
    (transport as any).onFlush = (buffer?: Buffer) => {
      if (buffer) {
        output = buffer;
      }
    };
    (transport as any).reset?.();
    message.write(protocol);
    transport.flush();
    return output;
  };

  return { serialize };
};

export const createThriftDeserializer = (factory = createBinaryProtocolFactory()) => {
  const deserialize = <T extends object>(target: T, buffer: Buffer): T => {
    let result = target;
    const receiver = thrift.TBufferedTransport.receiver((transport) => {
      const protocol = factory.create(transport);
      const ctor = (target as { constructor: { read?: (input: thrift.TProtocol) => T } }).constructor;
      if (ctor && typeof ctor.read === 'function') {
        const decoded = ctor.read(protocol);
        if (decoded !== target) {
          Object.assign(target, decoded);
        }
        result = target;
        return;
      }
      const instance = target as { read?: (input: thrift.TProtocol) => void };
      if (typeof instance.read === 'function') {
        instance.read(protocol);
        result = target;
        return;
      }
      throw new Error('Target does not support Thrift deserialization');
    }, 0);
    receiver(buffer);
    return result;
  };

  return { deserialize };
};
