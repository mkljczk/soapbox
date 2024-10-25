import { importEntities } from 'pl-fe/entity-store/actions';
import { Entities } from 'pl-fe/entity-store/entities';
import { useTransaction } from 'pl-fe/entity-store/hooks/use-transaction';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';

interface FollowOpts {
  reblogs?: boolean;
  notify?: boolean;
  languages?: string[];
}

const useFollow = () => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useLoggedIn();
  const { transaction } = useTransaction();

  const followEffect = (accountId: string) => {
    transaction({
      Accounts: {
        [accountId]: (account) => ({
          ...account,
          followers_count: account.followers_count + 1,
        }),
      },
      Relationships: {
        [accountId]: (relationship) => ({
          ...relationship,
          following: true,
        }),
      },
    });
  };

  const unfollowEffect = (accountId: string) => {
    transaction({
      Accounts: {
        [accountId]: (account) => ({
          ...account,
          followers_count: Math.max(0, account.followers_count - 1),
        }),
      },
      Relationships: {
        [accountId]: (relationship) => ({
          ...relationship,
          following: false,
        }),
      },
    });
  };

  const follow = async (accountId: string, options: FollowOpts = {}) => {
    if (!isLoggedIn) return;
    followEffect(accountId);

    try {
      const response = await client.accounts.followAccount(accountId, options);
      if (response.id) {
        dispatch(importEntities([response], Entities.RELATIONSHIPS));
      }
    } catch (e) {
      unfollowEffect(accountId);
    }
  };

  const unfollow = async (accountId: string) => {
    if (!isLoggedIn) return;
    unfollowEffect(accountId);

    try {
      await client.accounts.unfollowAccount(accountId);
    } catch (e) {
      followEffect(accountId);
    }
  };

  return {
    follow,
    unfollow,
    followEffect,
    unfollowEffect,
  };
};

export { useFollow };
