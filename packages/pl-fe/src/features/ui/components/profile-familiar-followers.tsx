import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import React, { useEffect } from 'react';
import { FormattedList, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { fetchAccountFamiliarFollowers } from 'pl-fe/actions/familiar-followers';
import AvatarStack from 'pl-fe/components/avatar-stack';
import HoverAccountWrapper from 'pl-fe/components/hover-account-wrapper';
import HStack from 'pl-fe/components/ui/hstack';
import Text from 'pl-fe/components/ui/text';
import VerificationBadge from 'pl-fe/components/verification-badge';
import Emojify from 'pl-fe/features/emoji/emojify';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { makeGetAccount } from 'pl-fe/selectors';
import { useModalsStore } from 'pl-fe/stores/modals';

import type { Account } from 'pl-fe/normalizers/account';

const getAccount = makeGetAccount();

interface IProfileFamiliarFollowers {
  account: Account;
}

const ProfileFamiliarFollowers: React.FC<IProfileFamiliarFollowers> = ({ account }) => {
  const { openModal } = useModalsStore();
  const dispatch = useAppDispatch();
  const me = useAppSelector((state) => state.me);
  const features = useFeatures();
  const familiarFollowerIds = useAppSelector(state => state.user_lists.familiar_followers.get(account.id)?.items || ImmutableOrderedSet<string>());
  const familiarFollowers: ImmutableOrderedSet<Account | null> = useAppSelector(state => familiarFollowerIds.slice(0, 2).map(accountId => getAccount(state, accountId)));

  useEffect(() => {
    if (me && features.familiarFollowers) {
      dispatch(fetchAccountFamiliarFollowers(account.id));
    }
  }, [account.id]);

  const openFamiliarFollowersModal = () => {
    openModal('FAMILIAR_FOLLOWERS', {
      accountId: account.id,
    });
  };

  if (familiarFollowerIds.size === 0) {
    return null;
  }

  const accounts: Array<React.ReactNode> = familiarFollowers.map(account => !!account && (
    <HoverAccountWrapper accountId={account.id} key={account.id} element='span'>
      <Link className='mention inline-block' to={`/@${account.acct}`}>
        <HStack space={1} alignItems='center' grow>
          <Text size='sm' theme='primary' truncate>
            <Emojify text={account.display_name} emojis={account.emojis} />
          </Text>

          {account.verified && <VerificationBadge />}
        </HStack>
      </Link>
    </HoverAccountWrapper>
  )).toArray().filter(Boolean);

  if (familiarFollowerIds.size > 2) {
    accounts.push(
      <span key='_' className='cursor-pointer hover:underline' role='presentation' onClick={openFamiliarFollowersModal}>
        <FormattedMessage
          id='account.familiar_followers.more'
          defaultMessage='{count, plural, one {# other} other {# others}} you follow'
          values={{ count: familiarFollowerIds.size - familiarFollowers.size }}
        />
      </span>,
    );
  }

  return (
    <HStack space={2} alignItems='center'>
      <AvatarStack accountIds={familiarFollowerIds} />
      <Text theme='muted' size='sm' tag='div'>
        <FormattedMessage
          id='account.familiar_followers'
          defaultMessage='Followed by {accounts}'
          values={{
            accounts: <FormattedList type='conjunction' value={accounts} />,
          }}
        />
      </Text>
    </HStack>
  );
};

export { ProfileFamiliarFollowers as default };
