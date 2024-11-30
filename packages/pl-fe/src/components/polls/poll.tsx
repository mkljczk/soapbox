import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { vote } from 'pl-fe/actions/polls';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useModalsStore } from 'pl-fe/stores/modals';

import PollFooter from './poll-footer';
import PollOption from './poll-option';

import type { Status } from 'pl-fe/normalizers/status';

type Selected = Record<number, boolean>;

interface IPoll {
  id: string;
  status?: Pick<Status, 'url'>;
  language?: string;
}

const messages = defineMessages({
  multiple: { id: 'poll.choose_multiple', defaultMessage: 'Choose as many as you\'d like.' },
});

const Poll: React.FC<IPoll> = ({ id, status, language }): JSX.Element | null => {
  const { openModal } = useModalsStore();
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const isLoggedIn = useAppSelector((state) => state.me);
  const poll = useAppSelector((state) => state.polls[id]);

  const [selected, setSelected] = useState({} as Selected);

  const openUnauthorizedModal = () =>
    openModal('UNAUTHORIZED', {
      action: 'POLL_VOTE',
      ap_id: status?.url,
    });

  const handleVote = (selectedId: number) => dispatch(vote(id, [selectedId]));

  const toggleOption = (value: number) => {
    if (isLoggedIn) {
      if (poll?.multiple) {
        const tmp = { ...selected };
        if (tmp[value]) {
          delete tmp[value];
        } else {
          tmp[value] = true;
        }
        setSelected(tmp);
      } else {
        const tmp: Selected = {};
        tmp[value] = true;
        setSelected(tmp);
        handleVote(value);
      }
    } else {
      openUnauthorizedModal();
    }
  };

  if (!poll) return null;

  const showResults = poll.voted || poll.expired;

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div onClick={e => e.stopPropagation()}>
      {!showResults && poll.multiple && (
        <Text className='mb-4' theme='muted' size='sm'>
          {intl.formatMessage(messages.multiple)}
        </Text>
      )}

      <Stack space={4}>
        <Stack space={2}>
          {poll.options.map((option, i) => (
            <PollOption
              key={i}
              poll={poll}
              option={option}
              index={i}
              showResults={showResults}
              active={!!selected[i]}
              onToggle={toggleOption}
              language={language}
            />
          ))}
        </Stack>

        <PollFooter
          poll={poll}
          showResults={showResults}
          selected={selected}
        />
      </Stack>
    </div>
  );
};

export { type Selected, Poll as default };
