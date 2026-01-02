namespace js bus.v1

struct Address {
  1: string country
  2: string city
  3: string street
  4: i32 zip
}

struct CommandPayload {
  1: string id
  2: string name
  3: i32 age
  4: list<string> tags
  5: Address address
  6: i64 createdAt
}
