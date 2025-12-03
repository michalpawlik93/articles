import * as E from 'fp-ts/Either';
import { Command } from './commands';

export type ParseError = string;

export const parseCommand = (
  input: string
): E.Either<ParseError, Command> => {
  const [rawCmd, ...args] = input.trim().split(/\s+/);

  if (!rawCmd) return E.left('Empty command');

  if (rawCmd === 'create-account') {
    if (args.length < 2)
      return E.left('Usage: create-account <id> <name>');
    return E.right({
      _tag: 'CreateAccount',
      id: args[0],
      name: args.slice(1).join(' '),
    });
  }

  if (rawCmd === 'show-account') {
    if (args.length < 1)
      return E.left('Usage: show-account <accountId>');
    return E.right({
      _tag: 'ShowAccount',
      accountId: args[0],
    });
  }

  if (rawCmd === 'exit') {
    return E.right({ _tag: 'Exit' });
  }

  return E.left(`Unknown command: ${rawCmd}`);
};

