import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { directComposeById } from 'pl-fe/actions/compose';
import { mountConversations, unmountConversations, expandConversations } from 'pl-fe/actions/conversations';
import { useDirectStream } from 'pl-fe/api/hooks/streaming/use-direct-stream';
import AccountSearch from 'pl-fe/components/account-search';
import Column from 'pl-fe/components/ui/column';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';

import ConversationsList from './components/conversations-list';

const messages = defineMessages({
  title: { id: 'column.direct', defaultMessage: 'Direct messages' },
  searchPlaceholder: { id: 'direct.search_placeholder', defaultMessage: 'Send a message to…' },
});

const ConversationsTimeline = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  useDirectStream();

  useEffect(() => {
    dispatch(mountConversations());
    dispatch(expandConversations(false));

    return () => {
      dispatch(unmountConversations());
    };
  }, []);

  const handleSuggestion = (accountId: string) => {
    dispatch(directComposeById(accountId));
  };

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <AccountSearch
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
        onSelected={handleSuggestion}
      />

      <ConversationsList />
    </Column>
  );
};

export { ConversationsTimeline as default };
