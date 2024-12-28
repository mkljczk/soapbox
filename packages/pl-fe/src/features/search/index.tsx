import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { saveSettings } from 'pl-fe/actions/settings';
import Column from 'pl-fe/components/ui/column';
import IconButton from 'pl-fe/components/ui/icon-button';
import Search from 'pl-fe/features/search/components/search';
import SearchResults from 'pl-fe/features/search/components/search-results';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useSettingsStore } from 'pl-fe/stores/settings';

const messages = defineMessages({
  heading: { id: 'column.search', defaultMessage: 'Search' },
  savedPinnedSearchesSuccess: { id: 'search.pin_searches.success', defaultMessage: 'Saved pinned searches' },
});

const SearchPage = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { handleSwitchPinnedSearch, rememberSearch, settings } = useSettingsStore();
  const { pinnedSearches, rememberSearchHistory } = settings;
  const [params] = useSearchParams();

  const value = params.get('q') || '';

  const isPinned = pinnedSearches.includes(value);

  const handlePinChange = () => {
    handleSwitchPinnedSearch(value);
    dispatch(saveSettings({
      showAlert: true,
      alertMessage: intl.formatMessage(messages.savedPinnedSearchesSuccess),
    }));
  };

  useEffect(() => {
    if (rememberSearchHistory) {
      rememberSearch(value);
      dispatch(saveSettings());
    }
  }, [value]);

  return (
    <Column
      label={intl.formatMessage(messages.heading)}
      action={value ? (
        <IconButton
          className='text-gray-600 hover:text-gray-700 dark:hover:text-gray-500'
          title={'Pin search'}
          src={isPinned ? require('@tabler/icons/outline/pinned-off.svg') : require('@tabler/icons/outline/pin.svg')}
          onClick={handlePinChange}
        />
      ) : undefined}
    >
      <div className='space-y-4'>
        <Search />
        <SearchResults />
      </div>
    </Column>
  );
};

export { SearchPage as default };
