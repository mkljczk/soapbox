import { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { Entities } from 'pl-fe/entity-store/entities';
import { useEntity } from 'pl-fe/entity-store/hooks/useEntity';
import { useAppSelector } from 'pl-fe/hooks/useAppSelector';
import { useClient } from 'pl-fe/hooks/useClient';
import { useFeatures } from 'pl-fe/hooks/useFeatures';
import { useLoggedIn } from 'pl-fe/hooks/useLoggedIn';
import { type Account, normalizeAccount } from 'pl-fe/normalizers/account';

import { useAccountScrobble } from './useAccountScrobble';
import { useRelationship } from './useRelationship';

import type { Account as BaseAccount } from 'pl-api';

interface UseAccountOpts {
  withRelationship?: boolean;
  withScrobble?: boolean;
}

const useAccount = (accountId?: string, opts: UseAccountOpts = {}) => {
  const client = useClient();
  const history = useHistory();
  const features = useFeatures();
  const { me } = useLoggedIn();
  const { withRelationship, withScrobble } = opts;

  const { entity, isUnauthorized, ...result } = useEntity<BaseAccount, Account>(
    [Entities.ACCOUNTS, accountId!],
    () => client.accounts.getAccount(accountId!),
    { enabled: !!accountId, transform: normalizeAccount },
  );

  const meta = useAppSelector((state) => accountId && state.accounts_meta[accountId]);

  const {
    relationship,
    isLoading: isRelationshipLoading,
  } = useRelationship(accountId, { enabled: withRelationship });

  const {
    scrobble,
    isLoading: isScrobbleLoading,
  } = useAccountScrobble(accountId, { enabled: withScrobble });

  const isBlocked = entity?.relationship?.blocked_by === true;
  const isUnavailable = (me === entity?.id) ? false : (isBlocked && !features.blockersVisible);

  const account = useMemo(
    () => entity ? { ...entity, relationship, scrobble, __meta: { meta, ...entity.__meta } } : undefined,
    [entity, relationship, scrobble],
  );

  useEffect(() => {
    if (isUnauthorized) {
      history.push('/login');
    }
  }, [isUnauthorized]);

  return {
    ...result,
    isLoading: result.isLoading,
    isRelationshipLoading,
    isScrobbleLoading,
    isUnauthorized,
    isUnavailable,
    account,
  };
};

export { useAccount };
