import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { fetchRelationships } from 'pl-fe/actions/accounts';
import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { store } from 'pl-fe/store';

import { removePageItem } from '../utils/queries';

import { mutationOptions } from './utils/mutation-options';

const SuggestionKeys = {
  suggestions: ['suggestions'] as const,
};

const suggestionsQueryOptions = queryOptions({
  queryKey: ['suggestions'],
  queryFn: async () => {
    const response = await getClient().myAccount.getSuggestions();

    const accounts = response.map(({ account }) => account);
    const accountIds = accounts.map((account) => account.id);
    store.dispatch(importEntities({ accounts }));
    store.dispatch(fetchRelationships(accountIds));

    return response.map(({ account, ...x }) => ({ ...x, account_id: account.id }));
  },
  placeholderData: keepPreviousData,
});

const dismissSuggestionMutationOptions = mutationOptions({
  mutationFn: (accountId: string) => getClient().myAccount.dismissSuggestions(accountId),
  onMutate(accountId: string) {
    removePageItem(SuggestionKeys.suggestions, accountId, (o: any, n: any) => o.account === n);
  },
});

export { suggestionsQueryOptions, dismissSuggestionMutationOptions };
