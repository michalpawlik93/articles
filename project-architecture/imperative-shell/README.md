# Functional Core / Imperative Shell (FC/IS) – Accounts + CLI (fp-ts)

This project demonstrates the **Functional Core / Imperative Shell** architecture using a simple example of accounts (`Account`) and an interactive CLI.

- **Functional Core** (`src/core/*.ts`):
  - pure functions, no side effects,
  - domain state `State` contains only accounts (`Account`),
  - uses `fp-ts/Either` instead of exceptions.
- **Imperative Shell** (`src/shell/*.ts`):
  - CLI based on `readline`,
  - reading/writing state to `data.json` file,
  - only calls functions from core and interprets their results.

Dependencies are unidirectional: **Shell depends on Core**, Core knows nothing about I/O or infrastructure.
All domain logic (creating/retrieving accounts) lives in the Functional Core, while the Imperative Shell handles only communication (console, file).

## Running

```bash
npm install
npm start
```

After running, you'll see the prompt:

```text
Accounts CLI (Functional Core / Imperative Shell, fp-ts)
Commands:
  create-account <id> <name>
  show-account <accountId>
  exit
---
> 
```

Example session:

```text
> create-account acc-1 John Doe
[ok]
> show-account acc-1
{
  "id": "acc-1",
  "name": "John Doe"
}
> exit
Bye!
```


