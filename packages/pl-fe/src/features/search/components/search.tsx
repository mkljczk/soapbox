import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import {
  clearSearch,
  clearSearchResults,
  setSearchAccount,
  showSearch,
  submitSearch,
} from 'pl-fe/actions/search';
import AutosuggestAccountInput from 'pl-fe/components/autosuggest-account-input';
import Input from 'pl-fe/components/ui/input';
import SvgIcon from 'pl-fe/components/ui/svg-icon';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { selectAccount } from 'pl-fe/selectors';
import { AppDispatch, RootState } from 'pl-fe/store';

const messages = defineMessages({
  placeholder: { id: 'search.placeholder', defaultMessage: 'Search' },
  action: { id: 'search.action', defaultMessage: 'Search for “{query}”' },
});

const redirectToAccount = (accountId: string, routerHistory: any) =>
  (_dispatch: AppDispatch, getState: () => RootState) => {
    const acct = selectAccount(getState(), accountId)!.acct;

    if (acct && routerHistory) {
      routerHistory.push(`/@${acct}`);
    }
  };

interface ISearch {
  autoFocus?: boolean;
  autoSubmit?: boolean;
  autosuggest?: boolean;
  openInRoute?: boolean;
}

const Search = (props: ISearch) => {
  const submittedValue = useAppSelector((state) => state.search.submittedValue);
  const [value, setValue] = useState(submittedValue);
  const {
    autoFocus = false,
    autoSubmit = false,
    autosuggest = false,
    openInRoute = false,
  } = props;

  const dispatch = useAppDispatch();
  const history = useHistory();
  const intl = useIntl();

  const submitted = useAppSelector((state) => state.search.submitted);

  const debouncedSubmit = useCallback(debounce((value: string) => {
    dispatch(submitSearch(value));
  }, 900), []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setValue(value);

    if (autoSubmit) {
      debouncedSubmit(value);
    }
  };

  const handleClear = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (value.length > 0 || submitted) {
      dispatch(clearSearchResults());
    }
  };

  const handleSubmit = () => {
    if (openInRoute) {
      dispatch(setSearchAccount(null));
      dispatch(submitSearch(value));

      history.push('/search');
    } else {
      dispatch(submitSearch(value));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      handleSubmit();
    } else if (event.key === 'Escape') {
      document.querySelector('.ui')?.parentElement?.focus();
    }
  };

  const handleFocus = () => {
    dispatch(showSearch());
  };

  const handleSelected = (accountId: string) => {
    dispatch(clearSearch());
    dispatch(redirectToAccount(accountId, history));
  };

  const makeMenu = () => [
    {
      text: intl.formatMessage(messages.action, { query: value }),
      icon: require('@fluentui/search_24_regular.svg'),
      action: handleSubmit,
    },
  ];

  const hasValue = value.length > 0 || submitted;
  const componentProps: any = {
    type: 'text',
    id: 'search',
    placeholder: intl.formatMessage(messages.placeholder),
    value,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    autoFocus: autoFocus,
    theme: 'search',
    className: 'pr-10 rtl:pl-10 rtl:pr-3',
  };

  useEffect(() => {
    if (value !== submittedValue) setValue(submittedValue);
  }, [submittedValue]);

  if (autosuggest) {
    componentProps.onSelected = handleSelected;
    componentProps.menu = makeMenu();
    componentProps.autoSelect = false;
  }

  return (
    <div
      className={clsx('w-full', {
        'sticky top-[76px] z-10 bg-white/90 backdrop-blur black:bg-black/80 dark:bg-primary-900/90': !openInRoute,
      })}
    >
      <label htmlFor='search' className='sr-only'>{intl.formatMessage(messages.placeholder)}</label>

      <div className='relative'>
        {autosuggest ? (
          <AutosuggestAccountInput {...componentProps} />
        ) : (
          <Input {...componentProps} />
        )}

        <div
          role='button'
          tabIndex={0}
          className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto'
          onClick={handleClear}
        >
          <SvgIcon
            src={require('@fluentui/search_24_regular.svg')}
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

export { Search as default };
