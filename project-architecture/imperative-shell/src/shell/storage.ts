import fs from 'fs/promises';
import { State, emptyState } from '../core/domain';

const DB_FILE = './data.json';

export const loadState = async (): Promise<State> => {
  try {
    const content = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(content) as State;
  } catch {
    return emptyState();
  }
};

export const saveState = (state: State): Promise<void> =>
  fs.writeFile(DB_FILE, JSON.stringify(state, null, 2), 'utf8');

