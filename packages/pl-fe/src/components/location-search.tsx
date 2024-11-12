import { useDebounce } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { useSearchLocation } from 'pl-hooks';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AutosuggestInput, { AutoSuggestion } from 'pl-fe/components/autosuggest-input';
import Icon from 'pl-fe/components/icon';

import type { Location } from 'pl-api';

const noOp = () => {};

const messages = defineMessages({
  placeholder: { id: 'location_search.placeholder', defaultMessage: 'Find an address' },
});

interface ILocationSearch {
  onSelected: (location: Location) => void;
}

const LocationSearch: React.FC<ILocationSearch> = ({ onSelected }) => {
  const intl = useIntl();

  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, 400);
  const locationsQuery = useSearchLocation(debouncedValue);

  const empty = !(value.length > 0);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    setValue(target.value);
  };

  const handleSelected = (_tokenStart: number, _lastToken: string | null, suggestion: AutoSuggestion) => {
    if (typeof suggestion === 'object' && 'origin_id' in suggestion) {
      onSelected(suggestion);
    }
  };

  const handleClear: React.MouseEventHandler = e => {
    e.preventDefault();

    if (!empty) {
      setValue('');
    }
  };

  const handleKeyDown: React.KeyboardEventHandler = e => {
    if (e.key === 'Escape') {
      document.querySelector('.ui')?.parentElement?.focus();
    }
  };

  return (
    <div className='relative'>
      <AutosuggestInput
        className='rounded-full'
        placeholder={intl.formatMessage(messages.placeholder)}
        value={value}
        onChange={handleChange}
        suggestions={locationsQuery.data || []}
        onSuggestionsFetchRequested={noOp}
        onSuggestionsClearRequested={noOp}
        onSuggestionSelected={handleSelected}
        searchTokens={[]}
        onKeyDown={handleKeyDown}
      />
      <div role='button' tabIndex={0} className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto' onClick={handleClear}>
        <Icon src={require('@tabler/icons/outline/search.svg')} className={clsx('size-5 text-gray-600', { 'hidden': !empty })} />
        <Icon src={require('@tabler/icons/outline/backspace.svg')} className={clsx('size-5 text-gray-600', { 'hidden': empty })} aria-label={intl.formatMessage(messages.placeholder)} />
      </div>
    </div>
  );
};

export { LocationSearch as default };
