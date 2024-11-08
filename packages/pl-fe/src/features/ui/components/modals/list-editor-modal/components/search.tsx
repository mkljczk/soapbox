import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { fetchListSuggestions, clearListSuggestions, changeListSuggestions } from 'pl-fe/actions/lists';
import Icon from 'pl-fe/components/icon';
import Button from 'pl-fe/components/ui/button';
import Form from 'pl-fe/components/ui/form';
import HStack from 'pl-fe/components/ui/hstack';
import Input from 'pl-fe/components/ui/input';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

const messages = defineMessages({
  search: { id: 'lists.search', defaultMessage: 'Search among people you follow' },
  searchTitle: { id: 'tabs_bar.search', defaultMessage: 'Search' },
});

const Search = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const value = useAppSelector((state) => state.listEditor.suggestions.value);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    dispatch(changeListSuggestions(e.target.value));
  };

  const handleSubmit = () => {
    dispatch(fetchListSuggestions(value));
  };

  const handleClear = () => {
    dispatch(clearListSuggestions());
  };

  const hasValue = value.length > 0;

  return (
    <Form onSubmit={handleSubmit}>
      <HStack space={2}>
        <label className='relative grow'>
          <span style={{ display: 'none' }}>{intl.formatMessage(messages.search)}</span>

          <Input
            type='text'
            value={value}
            onChange={handleChange}
            placeholder={intl.formatMessage(messages.search)}
          />
          <div role='button' tabIndex={0} className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto' onClick={handleClear}>
            <Icon src={require('@fluentui/backspace_24_regular.svg')} aria-label={intl.formatMessage(messages.search)} className={clsx('size-5 text-gray-600', { hidden: !hasValue })} />
          </div>
        </label>

        <Button onClick={handleSubmit}>{intl.formatMessage(messages.searchTitle)}</Button>
      </HStack>
    </Form>
  );
};

export { Search as default };
