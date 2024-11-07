import { Entities } from 'pl-fe/entity-store/entities';
import { useEntityLookup } from 'pl-fe/entity-store/hooks/use-entity-lookup';
import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';
import { type Account, normalizeAccount } from 'pl-fe/normalizers/account';

import { useAccountScrobble } from './use-account-scrobble';
import { useRelationship } from './use-relationship';

import type { Account as BaseAccount } from 'pl-api';

interface UseAccountLookupOpts {
  withRelationship?: boolean;
  withScrobble?: boolean;
}

const useAccountLookup = (acct: string | undefined, opts: UseAccountLookupOpts = {}) => {
  const client = useClient();
  const features = useFeatures();
  const { me } = useLoggedIn();
  const { withRelationship, withScrobble } = opts;

  const { entity: account, isUnauthorized, ...result } = useEntityLookup<BaseAccount, Account>(
    Entities.ACCOUNTS,
    (account) => account.acct.toLowerCase() === acct?.toLowerCase(),
    () => client.accounts.lookupAccount(acct!),
    { enabled: !!acct, transform: normalizeAccount },
  );

  const {
    relationship,
    isLoading: isRelationshipLoading,
  } = useRelationship(account?.id, { enabled: withRelationship });

  const {
    scrobble,
    isLoading: isScrobbleLoading,
  } = useAccountScrobble(account?.id, { enabled: withScrobble });

  const isBlocked = account?.relationship?.blocked_by === true;
  const isUnavailable = (me === account?.id) ? false : (isBlocked && !features.blockersVisible);

  return {
    ...result,
    isLoading: result.isLoading,
    isRelationshipLoading,
    isScrobbleLoading,
    isUnauthorized,
    isUnavailable,
    account: account ? { ...account, relationship, scrobble } : undefined,
  };
};

export { useAccountLookup };
