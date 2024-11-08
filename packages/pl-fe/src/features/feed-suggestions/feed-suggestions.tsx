import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import Card, { CardBody, CardTitle } from 'pl-fe/components/ui/card';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import VerificationBadge from 'pl-fe/components/verification-badge';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

import Emojify from '../emoji/emojify';
import ActionButton from '../ui/components/action-button';
import { HotKeys } from '../ui/components/hotkeys';

const messages = defineMessages({
  heading: { id: 'feed_suggestions.heading', defaultMessage: 'Suggested profiles' },
  viewAll: { id: 'feed_suggestions.view_all', defaultMessage: 'View all' },
});

interface ISuggestionItem {
  accountId: string;
}

const SuggestionItem: React.FC<ISuggestionItem> = ({ accountId }) => {
  const { account } = useAccount(accountId);
  if (!account) return null;

  return (
    <Stack space={3} className='w-52 shrink-0 rounded-md border border-solid border-gray-300 p-4 dark:border-gray-800 md:w-full md:shrink md:border-transparent md:p-0 dark:md:border-transparent'>
      <Link
        to={`/@${account.acct}`}
        title={account.acct}
      >
        <Stack space={3} className='mx-auto w-40 md:w-24'>
          <img
            src={account.avatar}
            className='mx-auto block size-16 min-w-[56px] rounded-full object-cover'
            alt={account.acct}
          />

          <Stack>
            <HStack alignItems='center' justifyContent='center' space={1}>
              <Text weight='semibold' truncate align='center' size='sm' className='max-w-[95%]'>
                <Emojify text={account.display_name} emojis={account.emojis} />
              </Text>

              {account.verified && <VerificationBadge />}
            </HStack>

            <Text theme='muted' align='center' size='sm' truncate>@{account.acct}</Text>
          </Stack>
        </Stack>
      </Link>

      <div className='text-center'>
        <ActionButton account={account} />
      </div>
    </Stack>
  );
};

interface IFeedSuggesetions {
  statusId: string;
  onMoveUp?: (statusId: string, featured?: boolean) => void;
  onMoveDown?: (statusId: string, featured?: boolean) => void;
}

const FeedSuggestions: React.FC<IFeedSuggesetions> = ({ statusId, onMoveUp, onMoveDown }) => {
  const intl = useIntl();
  const suggestedProfiles = useAppSelector((state) => state.suggestions.items);
  const isLoading = useAppSelector((state) => state.suggestions.isLoading);

  if (!isLoading && suggestedProfiles.length === 0) return null;

  const handleHotkeyMoveUp = (e?: KeyboardEvent): void => {
    if (onMoveUp) {
      onMoveUp(statusId);
    }
  };

  const handleHotkeyMoveDown = (e?: KeyboardEvent): void => {
    if (onMoveDown) {
      onMoveDown(statusId);
    }
  };

  const handlers = {
    moveUp: handleHotkeyMoveUp,
    moveDown: handleHotkeyMoveDown,
  };

  return (
    <HotKeys handlers={handlers}>
      <Card size='lg' variant='rounded' className='focusable space-y-6' tabIndex={0}>
        <HStack justifyContent='between' alignItems='center'>
          <CardTitle title={intl.formatMessage(messages.heading)} />

          <Link
            to='/suggestions'
            className='text-primary-600 hover:underline dark:text-accent-blue'
          >
            {intl.formatMessage(messages.viewAll)}
          </Link>
        </HStack>

        <CardBody>
          <HStack space={4} alignItems='center' className='overflow-x-auto md:space-x-0 lg:overflow-x-hidden'>
            {suggestedProfiles.slice(0, 4).map((suggestedProfile) => (
              <SuggestionItem key={suggestedProfile.account_id} accountId={suggestedProfile.account_id} />
            ))}
          </HStack>
        </CardBody>
      </Card>
    </HotKeys>
  );
};

export { FeedSuggestions as default };
