import { useTransaction } from 'pl-fe/entity-store/hooks/use-transaction';
import { useClient } from 'pl-fe/hooks/use-client';

import type { EntityCallbacks } from 'pl-fe/entity-store/hooks/types';
import type { Account } from 'pl-fe/normalizers/account';

const useVerify = () => {
  const client = useClient();
  const { transaction } = useTransaction();

  const verifyEffect = (accountId: string, verified: boolean) => {
    const updater = (account: Account): Account => {
      if (account.__meta.pleroma) {
        const tags = account.__meta.pleroma.tags.filter((tag: string) => tag !== 'verified');
        if (verified) {
          tags.push('verified');
        }
        account.__meta.pleroma.tags = tags;
      }
      account.verified = verified;
      return account;
    };

    transaction({
      Accounts: ({ [accountId]: updater }),
    });
  };

  const verify = async (accountId: string, callbacks?: EntityCallbacks<void, unknown>) => {
    verifyEffect(accountId, true);
    try {
      await client.admin.accounts.tagUser(accountId, ['verified']);
      callbacks?.onSuccess?.();
    } catch (e) {
      callbacks?.onError?.(e);
      verifyEffect(accountId, false);
    }
  };

  const unverify = async (accountId: string, callbacks?: EntityCallbacks<void, unknown>) => {
    verifyEffect(accountId, false);
    try {
      await client.admin.accounts.untagUser(accountId, ['verified']);
      callbacks?.onSuccess?.();
    } catch (e) {
      callbacks?.onError?.(e);
      verifyEffect(accountId, true);
    }
  };

  return {
    verify,
    unverify,
  };
};

export { useVerify };
