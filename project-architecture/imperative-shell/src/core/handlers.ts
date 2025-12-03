import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { CreateAccountCommand, ExitCommand, ShowAccountCommand } from './commands';
import { State, Result, Account } from './domain';
import * as A from './account';

export type ExecOutput =
  | { kind: 'None' }
  | { kind: 'AccountShown'; account: Account }
  | { kind: 'Exit' };

export type ExecResult = Result<{ state: State; output: ExecOutput }>;

export type CoreDeps = {
  createAccount: typeof A.createAccount;
  getAccount: typeof A.getAccount;
};

export const createAccountHandler =
  (deps: CoreDeps) =>
  (state: State, cmd: CreateAccountCommand): ExecResult =>
    pipe(
      deps.createAccount(state, cmd.id, cmd.name),
      E.map((s) => ({ state: s, output: { kind: 'None' } as ExecOutput }))
    );

export const showAccountHandler =
  (deps: CoreDeps) =>
  (state: State, cmd: ShowAccountCommand): ExecResult =>
    pipe(
      deps.getAccount(state, cmd.accountId),
      E.map((acc) => ({
        state,
        output: { kind: 'AccountShown', account: acc } as ExecOutput,
      }))
    );

export const exitHandler =
  (_deps: CoreDeps) =>
  (state: State, _cmd: ExitCommand): ExecResult =>
    E.right({ state, output: { kind: 'Exit' } });



