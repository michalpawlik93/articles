import { Command, CreateAccountCommand, ExitCommand, ShowAccountCommand } from '../core/commands';
import { State } from '../core/domain';
import {
  CoreDeps,
  createAccountHandler,
  ExecResult,
  exitHandler,
  showAccountHandler,
} from '../core/handlers';

export const createCommandBus =
  (deps: CoreDeps) =>
  (state: State, command: Command): ExecResult => {
    const handlers = {
      CreateAccount: createAccountHandler(deps),
      ShowAccount: showAccountHandler(deps),
      Exit: exitHandler(deps),
    };

    return handlers[command._tag](state, command as any);
  };
