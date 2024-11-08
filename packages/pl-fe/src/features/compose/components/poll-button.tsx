import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { addPoll, removePoll } from 'pl-fe/actions/compose';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';

import ComposeFormButton from './compose-form-button';

const messages = defineMessages({
  add_poll: { id: 'poll_button.add_poll', defaultMessage: 'Add a poll' },
  remove_poll: { id: 'poll_button.remove_poll', defaultMessage: 'Remove poll' },
});

interface IPollButton {
  composeId: string;
  disabled?: boolean;
}

const PollButton: React.FC<IPollButton> = ({ composeId, disabled }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const compose = useCompose(composeId);

  const unavailable = compose.is_uploading;
  const active = compose.poll !== null;

  const onClick = () => {
    if (active) {
      dispatch(removePoll(composeId));
    } else {
      dispatch(addPoll(composeId));
    }
  };

  if (unavailable) {
    return null;
  }

  return (
    <ComposeFormButton
      icon={require('@fluentui/poll_24_regular.svg')}
      title={intl.formatMessage(active ? messages.remove_poll : messages.add_poll)}
      active={active}
      disabled={disabled}
      onClick={onClick}
    />
  );
};

export { PollButton as default };
