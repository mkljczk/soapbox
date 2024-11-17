import { useNavigate, useSearch } from '@tanstack/react-router';
import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Input from 'pl-fe/components/ui/input';
import SvgIcon from 'pl-fe/components/ui/svg-icon';

const messages = defineMessages({
  placeholder: { id: 'search.placeholder', defaultMessage: 'Search' },
});

const Search = () => {
  const params = useSearch({ strict: false });
  const navigate = useNavigate();
  const [value, setValue] = useState(params.q || '');

  const intl = useIntl();

  const setQuery = (value: string) => {
    navigate({
      search: { ...params, q: value },
    });
  };

  const debouncedSubmit = useCallback(debounce((value: string) => {
    setQuery(value);
  }, 900), []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setValue(value);
    debouncedSubmit(value);
  };

  const handleClear = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (value.length > 0) {
      setValue('');
      setQuery('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      setQuery(value);
    } else if (event.key === 'Escape') {
      document.querySelector('.ui')?.parentElement?.focus();
    }
  };

  const hasValue = value.length > 0;

  return (
    <div
      className='sticky top-[76px] z-10 w-full bg-white/90 backdrop-blur black:bg-black/80 dark:bg-primary-900/90'
    >
      <label htmlFor='search' className='sr-only'>{intl.formatMessage(messages.placeholder)}</label>

      <div className='relative'>
        <Input
          type='text'
          id='search'
          placeholder={intl.formatMessage(messages.placeholder)}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus
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

export { Search as default };
