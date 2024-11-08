import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Text from 'pl-fe/components/ui/text';
import Widget from 'pl-fe/components/ui/widget';
import AccountContainer from 'pl-fe/containers/account-container';
import PlaceholderSidebarSuggestions from 'pl-fe/features/placeholder/components/placeholder-sidebar-suggestions';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useDismissSuggestion, useSuggestions } from 'pl-fe/queries/suggestions';

import type { Account as AccountEntity } from 'pl-fe/normalizers/account';

const messages = defineMessages({
  dismissSuggestion: { id: 'suggestions.dismiss', defaultMessage: 'Dismiss suggestion' },
});

interface IWhoToFollowPanel {
  limit: number;
}

const WhoToFollowPanel = ({ limit }: IWhoToFollowPanel) => {
  const features = useFeatures();
  const intl = useIntl();

  const { data: suggestions, isFetching } = useSuggestions();
  const dismissSuggestion = useDismissSuggestion();

  const suggestionsToRender = suggestions.slice(0, limit);

  const handleDismiss = (account: AccountEntity) => {
    dismissSuggestion.mutate(account.id);
  };

  if (!isFetching && !suggestionsToRender.length) {
    return null;
  }

  return (
    <Widget
      title={<FormattedMessage id='who_to_follow.title' defaultMessage='People to follow' />}
      action={
        <Link className='text-right' to='/suggestions'>
          <Text tag='span' theme='primary' size='sm' className='hover:underline'>
            <FormattedMessage id='feed_suggestions.view_all' defaultMessage='View all' />
          </Text>
        </Link>
      }
    >
      {isFetching ? (
        <PlaceholderSidebarSuggestions limit={limit} />
      ) : (
        suggestionsToRender.map((suggestion: any) => (
          <AccountContainer
            key={suggestion.account_id}
            id={suggestion.account_id}
            actionIcon={require('@fluentui/dismiss_24_regular.svg')}
            actionTitle={intl.formatMessage(messages.dismissSuggestion)}
            onActionClick={features.suggestionsDismiss ? handleDismiss : undefined}
          />
        ))
      )}
    </Widget>
  );
};

export { WhoToFollowPanel as default };
