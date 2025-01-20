import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Column from 'pl-fe/components/ui/column';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import AccountContainer from 'pl-fe/containers/account-container';
import { suggestionsQueryOptions } from 'pl-fe/queries/suggestions';

const messages = defineMessages({
  heading: { id: 'follow_recommendations.heading', defaultMessage: 'Suggested profiles' },
});

const FollowRecommendations: React.FC = () => {
  const intl = useIntl();

  const { data: suggestions = [], isFetching } = useQuery(suggestionsQueryOptions);

  if (suggestions.length === 0 && !isFetching) {
    return (
      <Column label={intl.formatMessage(messages.heading)}>
        <Text align='center'>
          <FormattedMessage id='empty_column.follow_recommendations' defaultMessage='Looks like no suggestions could be generated for you. You can try using search to look for people you might know or explore trending hashtags.' />
        </Text>
      </Column>
    );
  }

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={4}>
        <ScrollableList isLoading={isFetching} itemClassName='pb-4'>
          {suggestions.map((suggestion) => (
            <AccountContainer
              key={suggestion.account_id}
              id={suggestion.account_id}
              withAccountNote
            />
          ))}
        </ScrollableList>
      </Stack>
    </Column>
  );
};

export { FollowRecommendations as default };
