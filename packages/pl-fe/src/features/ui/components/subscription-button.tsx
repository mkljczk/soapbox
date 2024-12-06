import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useFollow } from 'pl-fe/api/hooks/accounts/use-follow';
import IconButton from 'pl-fe/components/ui/icon-button';
import { useFeatures } from 'pl-fe/hooks/use-features';
import toast from 'pl-fe/toast';

import type { Account as AccountEntity } from 'pl-fe/normalizers/account';

const messages = defineMessages({
  subscribe: { id: 'account.subscribe', defaultMessage: 'Subscribe to notifications from @{name}' },
  unsubscribe: { id: 'account.unsubscribe', defaultMessage: 'Unsubscribe to notifications from @{name}' },
  subscribeSuccess: { id: 'account.subscribe.success', defaultMessage: 'You have subscribed to this account.' },
  unsubscribeSuccess: { id: 'account.unsubscribe.success', defaultMessage: 'You have unsubscribed from this account.' },
  subscribeFailure: { id: 'account.subscribe.failure', defaultMessage: 'An error occurred trying to subscribe to this account.' },
  unsubscribeFailure: { id: 'account.unsubscribe.failure', defaultMessage: 'An error occurred trying to unsubscribe to this account.' },
});

interface ISubscriptionButton {
  account: Pick<AccountEntity, 'id' | 'username' | 'relationship'>;
}

const SubscriptionButton = ({ account }: ISubscriptionButton) => {
  const features = useFeatures();
  const intl = useIntl();
  const { follow } = useFollow();

  const isFollowing = account.relationship?.following;
  const isRequested = account.relationship?.requested;
  const isSubscribed = account.relationship?.notifying;
  const title = isSubscribed
    ? intl.formatMessage(messages.unsubscribe, { name: account.username })
    : intl.formatMessage(messages.subscribe, { name: account.username });

  const onNotifyToggle = () => {
    if (account.relationship?.notifying) {
      follow(account.id, { notify: false })
        ?.then(() => toast.success(intl.formatMessage(messages.unsubscribeSuccess)))
        .catch(() => toast.error(intl.formatMessage(messages.unsubscribeFailure)));
    } else {
      follow(account.id, { notify: true })
        ?.then(() => toast.success(intl.formatMessage(messages.subscribeSuccess)))
        .catch(() => toast.error(intl.formatMessage(messages.subscribeFailure)));
    }
  };

  const handleToggle = () => {
    onNotifyToggle();
  };

  if (!features.accountNotifies) {
    return null;
  }

  if (isRequested || isFollowing) {
    return (
      <IconButton
        src={isSubscribed ? require('@tabler/icons/outline/bell-ringing.svg') : require('@tabler/icons/outline/bell.svg')}
        onClick={handleToggle}
        title={title}
        theme='outlined'
        className='px-2'
        iconClassName='h-4 w-4'
      />
    );
  }

  return null;
};

export { SubscriptionButton as default };
