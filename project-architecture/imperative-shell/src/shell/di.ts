import { Command } from '../core/commands';
import { State } from '../core/domain';
import { ExecResult } from '../core/handlers';
import { loadState } from './storage';
import * as accountCore from '../core/account';
import { createCommandBus } from './commandBus';

interface SetUp{
    session: State;
    commandBus:(state: State, command: Command) => ExecResult
}
    
export const diContainer = async (): Promise<SetUp> => {
    const state: State = await loadState();
    const bus = createCommandBus({
        createAccount: accountCore.createAccount,
        getAccount: accountCore.getAccount,
    });

    return { session:state, commandBus: bus };
};
