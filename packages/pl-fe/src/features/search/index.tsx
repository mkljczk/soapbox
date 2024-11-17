import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Column from 'pl-fe/components/ui/column';
import Search from 'pl-fe/features/search/components/search';
import SearchResults from 'pl-fe/features/search/components/search-results';

const messages = defineMessages({
  heading: { id: 'column.search', defaultMessage: 'Search' },
});

const SearchPage = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='space-y-4'>
        <Search />
        <SearchResults />
      </div>
    </Column>
  );
};

export { SearchPage as default };
