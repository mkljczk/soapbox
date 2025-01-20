import { queryOptions } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { store } from 'pl-fe/store';

import type { Suggestion } from 'pl-api';

type MinifiedSuggestion = Omit<Suggestion, 'account'> & { account_id: string };

const suggestedAccountsQueryOptions = queryOptions({
  queryKey: ['suggestions'],
  queryFn: () => getClient().myAccount.getSuggestions().then((suggestions) => {
    store.dispatch(importEntities({ accounts: suggestions.map(({ account }) => account) }));
    return suggestions.map(({ account, ...suggestion }): MinifiedSuggestion => ({ account_id: account.id, ...suggestion }));
  }),
  // enabled: features.suggestions || features.suggestionsV2,
});

export { suggestedAccountsQueryOptions, type MinifiedSuggestion };
