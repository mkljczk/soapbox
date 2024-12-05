import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom-v5-compat';

import Input from 'pl-fe/components/ui/input';
import SvgIcon from 'pl-fe/components/ui/svg-icon';

const messages = defineMessages({
  placeholder: { id: 'search.placeholder', defaultMessage: 'Search' },
});

const Search = () => {
  const [params, setParams] = useSearchParams();
  const [value, setValue] = useState(params.get('q') || '');

  const intl = useIntl();

  const setQuery = (value: string) => {
    setParams(params => ({ ...Object.fromEntries(params.entries()), q: value }));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setValue(value);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (params.get('q') === value) {
      if (value.length > 0) {
        setValue('');
        setQuery('');
      }
    } else {
      setQuery(value);
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

  return (
    <div
      className='black:bg-black/80 dark:bg-primary-900/90 sticky top-[76px] z-10 w-full bg-white/90 backdrop-blur'
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
          onClick={handleClick}
        >
          {params.get('q') === value ? (
            <SvgIcon
              src={require('@tabler/icons/outline/x.svg')}
              className='size-4 text-gray-600'
              aria-label={intl.formatMessage(messages.placeholder)}
            />
          ) : (
            <SvgIcon
              src={require('@tabler/icons/outline/search.svg')}
              className='size-4 text-gray-600'
            />
          )}

        </div>
      </div>
    </div>
  );
};

export { Search as default };
