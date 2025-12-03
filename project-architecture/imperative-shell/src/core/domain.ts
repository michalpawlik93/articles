import * as E from 'fp-ts/Either';

export type Account = {
  id: string;
  name: string;
};

export type State = {
  accounts: Record<string, Account>;
};

export const emptyState = (): State => ({ accounts: {} });

export type DomainError = string;

export type Result<A> = E.Either<DomainError, A>;

