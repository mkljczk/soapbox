import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { saveSettings } from 'pl-fe/actions/settings';
import AutosuggestAccountInput from 'pl-fe/components/autosuggest-account-input';
import SvgIcon from 'pl-fe/components/ui/svg-icon';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { selectAccount } from 'pl-fe/selectors';
import { useSettingsStore } from 'pl-fe/stores/settings';

import type { AppDispatch, RootState } from 'pl-fe/store';
import type { History } from 'pl-fe/types/history';

const messages = defineMessages({
  placeholder: { id: 'search.placeholder', defaultMessage: 'Search' },
  action: { id: 'search.action', defaultMessage: 'Search for “{query}”' },
  forgetSearchHistory: { id: 'search.history.forget', defaultMessage: 'Remove recent search' },
});

const redirectToAccount = (accountId: string, routerHistory: History) =>
  (_dispatch: AppDispatch, getState: () => RootState) => {
    const acct = selectAccount(getState(), accountId)!.acct;

    if (acct && routerHistory) {
      routerHistory.push(`/@${acct}`);
    }
  };

const SearchInput = () => {
  const [value, setValue] = useState('');

  const dispatch = useAppDispatch();
  const history = useHistory();
  const intl = useIntl();
  const { settings, forgetSearch } = useSettingsStore();
  const { recentSearches, pinnedSearches } = settings;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setValue(value);
  };

  const handleClear = (event: React.MouseEvent<HTMLDivElement>) => {
    setValue('');
  };

  const handleSubmit = () => {
    setValue('');
    history.push('/search?' + new URLSearchParams({ q: value }));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      handleSubmit();
    } else if (event.key === 'Escape') {
      document.querySelector('.ui')?.parentElement?.focus();
    }
  };

  const handleSelected = (accountId: string) => {
    setValue('');
    dispatch(redirectToAccount(accountId, history));
  };

  const handleForgetSearchHistory = (value: string) => () => {
    forgetSearch(value);
    dispatch(saveSettings());
  };

  const makeMenu = () => value.length ? [
    {
      text: intl.formatMessage(messages.action, { query: value }),
      icon: require('@tabler/icons/outline/search.svg'),
      action: handleSubmit,
    },
  ] : [
    ...recentSearches.map((value) => ({
      text: value,
      icon: require('@tabler/icons/outline/history.svg'),
      to: '/search?' + new URLSearchParams({ q: value }),
      secondaryIcon: require('@tabler/icons/outline/x.svg'),
      secondaryAction: handleForgetSearchHistory(value),
      secondaryTitle: intl.formatMessage(messages.forgetSearchHistory),
    })),
    ...pinnedSearches.map((value) => ({
      text: value,
      icon: require('@tabler/icons/outline/pin.svg'),
      to: '/search?' + new URLSearchParams({ q: value }),
    })),
  ];

  const hasValue = value.length > 0;

  return (
    <div className='w-full'>
      <label htmlFor='search' className='sr-only'>{intl.formatMessage(messages.placeholder)}</label>

      <div className='relative'>
        <AutosuggestAccountInput
          id='search'
          placeholder={intl.formatMessage(messages.placeholder)}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelected={handleSelected}
          menu={makeMenu()}
          autoSelect={false}
          theme='search'
          className='pr-10 rtl:pl-10 rtl:pr-3'
        />

        <div
          role='button'
          tabIndex={0}
          className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto'
          onClick={handleClear}
        >
          <SvgIcon
            src={require('@tabler/icons/outline/search.svg')}
            className={clsx('size-4 text-gray-600', { hidden: hasValue })}
          />

          <SvgIcon
            src={require('@tabler/icons/outline/x.svg')}
            className={clsx('size-4 text-gray-600', { hidden: !hasValue })}
            aria-label={intl.formatMessage(messages.placeholder)}
          />
        </div>
      </div>
    </div>
  );
};

export { SearchInput as default };
