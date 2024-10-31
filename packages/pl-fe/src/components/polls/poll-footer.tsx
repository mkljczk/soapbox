import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchPoll, vote } from 'pl-fe/actions/polls';
import Button from 'pl-fe/components/ui/button';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Tooltip from 'pl-fe/components/ui/tooltip';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';

import RelativeTimestamp from '../relative-timestamp';

import type { Selected } from './poll';
import type { Poll } from 'pl-api';

const messages = defineMessages({
  closed: { id: 'poll.closed', defaultMessage: 'Closed' },
  nonAnonymous: { id: 'poll.non_anonymous.label', defaultMessage: 'Other instances may display the options you voted for' },
});

interface IPollFooter {
  poll: Poll;
  showResults: boolean;
  selected: Selected;
}

const PollFooter: React.FC<IPollFooter> = ({ poll, showResults, selected }): JSX.Element => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const handleVote = () => dispatch(vote(poll.id, Object.keys(selected) as any as number[]));

  const handleRefresh: React.EventHandler<React.MouseEvent> = (e) => {
    dispatch(fetchPoll(poll.id));
    e.stopPropagation();
    e.preventDefault();
  };

  const timeRemaining = poll.expires_at && (
    poll.expired ?
      intl.formatMessage(messages.closed) :
      <RelativeTimestamp weight='medium' timestamp={poll.expires_at} futureDate />
  );

  let votesCount = null;

  if (poll.voters_count !== null && poll.voters_count !== undefined) {
    votesCount = <FormattedMessage id='poll.total_people' defaultMessage='{count, plural, one {# person} other {# people}}' values={{ count: poll.voters_count }} />;
  } else {
    votesCount = <FormattedMessage id='poll.total_votes' defaultMessage='{count, plural, one {# vote} other {# votes}}' values={{ count: poll.votes_count }} />;
  }

  return (
    <Stack space={4} data-testid='poll-footer'>
      {(!showResults && poll.multiple) && (
        <Button onClick={handleVote} theme='primary' block>
          <FormattedMessage id='poll.vote' defaultMessage='Submit Vote' />
        </Button>
      )}

      <HStack space={1.5} alignItems='center' wrap>
        {poll.non_anonymous && (
          <>
            <Tooltip text={intl.formatMessage(messages.nonAnonymous)}>
              <Text theme='muted' weight='medium'>
                <FormattedMessage id='poll.non_anonymous' defaultMessage='Public poll' />
              </Text>
            </Tooltip>

            <Text theme='muted'>&middot;</Text>
          </>
        )}

        {showResults && (
          <>
            <button className='text-gray-600 underline' onClick={handleRefresh} data-testid='poll-refresh'>
              <Text theme='muted' weight='medium'>
                <FormattedMessage id='poll.refresh' defaultMessage='Refresh' />
              </Text>
            </button>

            <Text theme='muted'>&middot;</Text>
          </>
        )}

        <Text theme='muted' weight='medium'>
          {votesCount}
        </Text>

        {poll.expires_at !== null && (
          <>
            <Text theme='muted'>&middot;</Text>
            <Text weight='medium' theme='muted' data-testid='poll-expiration'>{timeRemaining}</Text>
          </>
        )}
      </HStack>
    </Stack>
  );
};

export { PollFooter as default };
