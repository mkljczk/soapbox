import clsx from 'clsx';
import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import throttle from 'lodash/throttle';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { locationSearch } from 'pl-fe/actions/events';
import AutosuggestInput, { AutoSuggestion } from 'pl-fe/components/autosuggest-input';
import Icon from 'pl-fe/components/icon';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';

import AutosuggestLocation from './autosuggest-location';

const noOp = () => {};

const messages = defineMessages({
  placeholder: { id: 'location_search.placeholder', defaultMessage: 'Find an address' },
});

interface ILocationSearch {
  onSelected: (locationId: string) => void;
}

const LocationSearch: React.FC<ILocationSearch> = ({ onSelected }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [locationIds, setLocationIds] = useState(ImmutableOrderedSet<string>());
  const controller = useRef(new AbortController());

  const [value, setValue] = useState('');

  const empty = !(value.length > 0);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    refreshCancelToken();
    handleLocationSearch(target.value);
    setValue(target.value);
  };

  const handleSelected = (_tokenStart: number, _lastToken: string | null, suggestion: AutoSuggestion) => {
    if (typeof suggestion === 'string') {
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

  const refreshCancelToken = () => {
    controller.current.abort();
    controller.current = new AbortController();
  };

  const clearResults = () => {
    setLocationIds(ImmutableOrderedSet());
  };

  const handleLocationSearch = useCallback(throttle(q => {
    dispatch(locationSearch(q, controller.current.signal))
      .then((locations: { origin_id: string }[]) => {
        const locationIds = locations.map(location => location.origin_id);
        setLocationIds(ImmutableOrderedSet(locationIds));
      })
      .catch(noOp);
  }, 900, { leading: true, trailing: true }), []);

  useEffect(() => {
    if (value === '') {
      clearResults();
    }
  }, [value]);

  return (
    <div className='relative'>
      <AutosuggestInput
        className='rounded-full'
        placeholder={intl.formatMessage(messages.placeholder)}
        value={value}
        onChange={handleChange}
        suggestions={locationIds.toList()}
        onSuggestionsFetchRequested={noOp}
        onSuggestionsClearRequested={noOp}
        onSuggestionSelected={handleSelected}
        searchTokens={[]}
        onKeyDown={handleKeyDown}
        renderSuggestion={AutosuggestLocation}
      />
      <div role='button' tabIndex={0} className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto' onClick={handleClear}>
        <Icon src={require('@tabler/icons/outline/search.svg')} className={clsx('size-5 text-gray-600', { 'hidden': !empty })} />
        <Icon src={require('@tabler/icons/outline/backspace.svg')} className={clsx('size-5 text-gray-600', { 'hidden': empty })} aria-label={intl.formatMessage(messages.placeholder)} />
      </div>
    </div>
  );
};

export { LocationSearch as default };
