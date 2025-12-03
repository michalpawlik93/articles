export type CreateAccountCommand = {
  _tag: 'CreateAccount';
  id: string;
  name: string;
};

export type ShowAccountCommand = {
  _tag: 'ShowAccount';
  accountId: string;
};

export type ExitCommand = {
  _tag: 'Exit';
};

export type Command =
  | CreateAccountCommand
  | ShowAccountCommand
  | ExitCommand;