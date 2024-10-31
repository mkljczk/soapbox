import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from 'pl-fe/components/list';
import Toggle from 'pl-fe/components/ui/toggle';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { useUpdateCredentials } from 'pl-fe/queries/accounts';

const messages = defineMessages({
  label: { id: 'settings.messages.label', defaultMessage: 'Allow users to start a new chat with you' },
});

const MessagesSettings = () => {
  const { account } = useOwnAccount();
  const intl = useIntl();
  const updateCredentials = useUpdateCredentials();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateCredentials.mutate({ accepts_chat_messages: event.target.checked });
  };

  if (!account) {
    return null;
  }

  return (
    <List>
      <ListItem
        label={intl.formatMessage(messages.label)}
      >
        <Toggle
          checked={account.accepts_chat_messages || false}
          onChange={handleChange}
        />
      </ListItem>
    </List>
  );
};

export { MessagesSettings as default };
