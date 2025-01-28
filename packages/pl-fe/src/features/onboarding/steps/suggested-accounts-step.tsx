import { useQuery } from '@tanstack/react-query';
import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import { BigCard } from 'pl-fe/components/big-card';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Button from 'pl-fe/components/ui/button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import AccountContainer from 'pl-fe/containers/account-container';
import { suggestionsQueryOptions } from 'pl-fe/queries/suggestions';

const SuggestedAccountsStep = ({ onNext }: { onNext: () => void }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { data, isFetching } = useQuery(suggestionsQueryOptions);

  const renderSuggestions = () => {
    if (!data) {
      return null;
    }

    return (
      <div className='flex flex-col sm:pb-10 sm:pt-4' ref={parentRef}>
        <ScrollableList
          isLoading={isFetching}
          style={{ height: 320 }}
          parentRef={parentRef}
        >
          {data.map((suggestion) => (
            <div key={suggestion.account_id} className='py-2'>
              <AccountContainer
                id={suggestion.account_id}
                showAccountHoverCard={false}
                withLinkToProfile={false}
              />
            </div>
          ))}
        </ScrollableList>
      </div>
    );
  };

  const renderEmpty = () => (
    <div className='my-2 rounded-lg bg-primary-50 p-8 text-center dark:bg-gray-800'>
      <Text>
        <FormattedMessage id='empty_column.follow_recommendations' defaultMessage='Looks like no suggestions could be generated for you. You can try using search to look for people you might know or explore trending hashtags.' />
      </Text>
    </div>
  );

  const renderBody = () => {
    if (!data || data.length === 0) {
      return renderEmpty();
    } else {
      return renderSuggestions();
    }
  };

  return (
    <BigCard
      title={<FormattedMessage id='onboarding.suggestions.title' defaultMessage='Suggested accounts' />}
      subtitle={<FormattedMessage id='onboarding.suggestions.subtitle' defaultMessage='Here are a few of the most popular accounts you might like.' />}
    >
      {renderBody()}

      <Stack>
        <Stack justifyContent='center' space={2}>
          <Button
            block
            theme='primary'
            onClick={onNext}
          >
            <FormattedMessage id='onboarding.done' defaultMessage='Done' />
          </Button>

          <Button block theme='tertiary' type='button' onClick={onNext}>
            <FormattedMessage id='onboarding.skip' defaultMessage='Skip for now' />
          </Button>
        </Stack>
      </Stack>
    </BigCard>
  );
};

export { SuggestedAccountsStep as default };
