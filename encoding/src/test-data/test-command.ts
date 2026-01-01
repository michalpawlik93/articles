import type { CommandPayload } from '../types.js';

export const samplePayload: CommandPayload = {
  id: 'user-1',
  name: 'Jogn Doy',
  age: 33,
  tags: ['premium', 'beta', 'pl'],
  address: {
    country: 'UK',
    city: 'London',
    street: 'St Peter 1',
    zip: 12345,
  },
  createdAt: Date.now(),
};
