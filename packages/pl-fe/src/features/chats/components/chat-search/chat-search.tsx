import { useMutation } from '@tanstack/react-query';
import React, { useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import Icon from 'pl-fe/components/ui/icon';
import Input from 'pl-fe/components/ui/input';
import Stack from 'pl-fe/components/ui/stack';
import { ChatWidgetScreens, useChatContext } from 'pl-fe/contexts/chat-context';
import { useDebounce } from 'pl-fe/hooks/use-debounce';
import { useChats } from 'pl-fe/queries/chats';
import { queryClient } from 'pl-fe/queries/client';
import useAccountSearch from 'pl-fe/queries/search';
import toast from 'pl-fe/toast';

import Blankslate from './blankslate';
import EmptyResultsBlankslate from './empty-results-blankslate';
import Results from './results';

import type { PlfeResponse } from 'pl-fe/api';

const messages = defineMessages({
  placeholder: { id: 'chat_search.placeholder', defaultMessage: 'Type a name' },
});

interface IChatSearch {
  isMainPage?: boolean;
}

const ChatSearch: React.FC<IChatSearch> = ({ isMainPage = false }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const intl = useIntl();

  const debounce = useDebounce;
  const history = useHistory();

  const { changeScreen } = useChatContext();
  const { getOrCreateChatByAccountId } = useChats();

  const [value, setValue] = useState<string>('');
  const debouncedValue = debounce(value as string, 300);

  const accountSearchResult = useAccountSearch(debouncedValue);
  const { data: accounts, isFetching } = accountSearchResult;

  const hasSearchValue = debouncedValue && debouncedValue.length > 0;
  const hasSearchResults = (accounts || []).length > 0;

  const handleClickOnSearchResult = useMutation({
    mutationFn: (accountId: string) => getOrCreateChatByAccountId(accountId),
    onError: (error: { response: PlfeResponse }) => {
      const data = error.response?.json as any;
      toast.error(data?.error);
    },
    onSuccess: (response) => {
      if (isMainPage) {
        history.push(`/chats/${response.id}`);
      } else {
        changeScreen(ChatWidgetScreens.CHAT, response.id);
      }

      queryClient.invalidateQueries({ queryKey: ['chats', 'search'] });
    },
  });

  const renderBody = () => {
    if (hasSearchResults) {
      return (
        <Results
          accountSearchResult={accountSearchResult}
          onSelect={(id) => {
            handleClickOnSearchResult.mutate(id);
            clearValue();
          }}
          parentRef={parentRef}
        />
      );
    } else if (hasSearchValue && !hasSearchResults && !isFetching) {
      return <EmptyResultsBlankslate />;
    } else {
      return <Blankslate />;
    }
  };

  const clearValue = () => {
    if (hasSearchValue) {
      setValue('');
    }
  };

  return (
    <Stack space={4} className='relative -mt-1 h-full overflow-auto'>
      <div className='px-4 pt-1'>
        <Input
          data-testid='search'
          type='text'
          autoFocus
          placeholder={intl.formatMessage(messages.placeholder)}
          value={value || ''}
          onChange={(event) => setValue(event.target.value)}
          outerClassName='mt-0'
          theme='search'
          append={
            <button onClick={clearValue}>
              <Icon
                src={hasSearchValue ? require('@tabler/icons/outline/x.svg') : require('@fluentui/search_24_regular.svg')}
                className='size-4 text-gray-700 dark:text-gray-600'
                aria-hidden='true'
              />
            </button>
          }
        />
      </div>

      <Stack className='h-full grow overflow-auto' ref={parentRef}>
        {renderBody()}
      </Stack>
    </Stack>
  );
};

export { ChatSearch as default };
