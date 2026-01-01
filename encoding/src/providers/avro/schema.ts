export const commandPayloadSchema = {
  type: 'record',
  name: 'CommandPayload',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'age', type: 'int' },
    { name: 'tags', type: { type: 'array', items: 'string' } },
    {
      name: 'address',
      type: {
        type: 'record',
        name: 'Address',
        fields: [
          { name: 'country', type: 'string' },
          { name: 'city', type: 'string' },
          { name: 'street', type: 'string' },
          { name: 'zip', type: 'int' },
        ],
      },
    },
    { name: 'createdAt', type: 'long' },
  ],
};
