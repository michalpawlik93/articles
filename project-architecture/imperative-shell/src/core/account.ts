import { State, Account, Result } from './domain';
import * as E from 'fp-ts/Either';

export const createAccount = (
  state: State,
  id: string,
  name: string
): Result<State> =>
  state.accounts[id]
    ? E.left(`Account '${id}' already exists`)
    : E.right({
        ...state,
        accounts: {
          ...state.accounts,
          [id]: { id, name },
        },
      });

export const getAccount = (state: State, accountId: string): Result<Account> =>
  state.accounts[accountId]
    ? E.right(state.accounts[accountId])
    : E.left(`Account '${accountId}' not found`);

