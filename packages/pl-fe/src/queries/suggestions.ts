import { useMutation, keepPreviousData, useQuery } from '@tanstack/react-query';

import { fetchRelationships } from 'pl-fe/actions/accounts';
import { importFetchedAccounts } from 'pl-fe/actions/importer';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';

import { removePageItem } from '../utils/queries';

const SuggestionKeys = {
  suggestions: ['suggestions'] as const,
};

const useSuggestions = () => {
  const client = useClient();
  const dispatch = useAppDispatch();

  const getSuggestions = async () => {
    const response = await client.myAccount.getSuggestions();

    const accounts = response.map(({ account }) => account);
    const accountIds = accounts.map((account) => account.id);
    dispatch(importFetchedAccounts(accounts));
    dispatch(fetchRelationships(accountIds));

    return response.map(({ account, ...x }) => ({ ...x, account_id: account.id }));
  };

  const result = useQuery({
    queryKey: SuggestionKeys.suggestions,
    queryFn: () => getSuggestions(),
    placeholderData: keepPreviousData,
  });

  const data = result.data;

  return {
    ...result,
    data: data || [],
  };
};

const useDismissSuggestion = () => {
  const client = useClient();

  return useMutation({
    mutationFn: (accountId: string) => client.myAccount.dismissSuggestions(accountId),
    onMutate(accountId: string) {
      removePageItem(SuggestionKeys.suggestions, accountId, (o: any, n: any) => o.account === n);
    },
  });
};

const useOnboardingSuggestions = () => {
  const client = useClient();
  const dispatch = useAppDispatch();

  const getSuggestions = async () => {
    const response = await client.myAccount.getSuggestions();

    const accounts = response.map(({ account }) => account);
    const accountIds = accounts.map((account) => account.id);
    dispatch(importFetchedAccounts(accounts));
    dispatch(fetchRelationships(accountIds));

    return response;
  };

  const result = useQuery({
    queryKey: ['suggestions', 'v2'],
    queryFn: () => getSuggestions(),
    placeholderData: keepPreviousData,
  });

  const data = result.data;

  return {
    ...result,
    data,
  };
};

export { useOnboardingSuggestions, useSuggestions, useDismissSuggestion };
