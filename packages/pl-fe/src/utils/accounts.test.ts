import { AccountRecord } from 'pl-fe/normalizers/account';

import {
  getDomain,
} from './accounts';

import type { ReducerAccount } from 'pl-fe/reducers/accounts';

describe('getDomain', () => {
  const account = AccountRecord({
    acct: 'alice',
    url: 'https://party.com/users/alice',
  }) as ReducerAccount;
  it('returns the domain', () => {
    expect(getDomain(account)).toEqual('party.com');
  });
});
