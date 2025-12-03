import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {  saveState } from './storage';
import { parseCommand } from '../core/parser';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import {diContainer} from './di';

async function main() {
  const container = await diContainer();
  const rl = readline.createInterface({ input, output });

  console.log('Accounts CLI (Functional Core / Imperative Shell, fp-ts)');
  console.log('Commands:');
  console.log('  create-account <id> <name>');
  console.log('  show-account <accountId>');
  console.log('  exit');
  console.log('---');

  loop: while (true) {
    const line = await rl.question('> ');

    const res = pipe(
      parseCommand(line),
      E.chain((cmd) => container.commandBus(container.session, cmd))
    );

    if (E.isLeft(res)) {
      console.error('[error]', res.left);
      continue;
    }

    const { state: newState, output } = res.right;
    container.session = newState;

    await saveState(container.session);

    if (output.kind === 'AccountShown') {
      console.log(JSON.stringify(output.account, null, 2));
    } else if (output.kind === 'Exit') {
      console.log('Bye!');
      break loop;
    } else {
      console.log('[ok]');
    }
  }

  rl.close();
}

main().catch((err) => {
  console.error('Fatal error:', err);
});

