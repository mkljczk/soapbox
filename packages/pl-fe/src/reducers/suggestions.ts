import { Record as ImmutableRecord } from 'immutable';

import { ACCOUNT_BLOCK_SUCCESS, ACCOUNT_MUTE_SUCCESS } from 'pl-fe/actions/accounts';
import { DOMAIN_BLOCK_SUCCESS, type DomainBlocksAction } from 'pl-fe/actions/domain-blocks';
import {
  SUGGESTIONS_FETCH_REQUEST,
  SUGGESTIONS_FETCH_SUCCESS,
  SUGGESTIONS_FETCH_FAIL,
} from 'pl-fe/actions/suggestions';

import type { Suggestion as SuggestionEntity } from 'pl-api';
import type { AnyAction } from 'redux';

const ReducerRecord = ImmutableRecord({
  items: Array<MinifiedSuggestion>(),
  isLoading: false,
});

type State = ReturnType<typeof ReducerRecord>;

const minifySuggestion = ({ account, ...suggestion }: SuggestionEntity) => ({
  ...suggestion,
  account_id: account.id,
});

type MinifiedSuggestion = ReturnType<typeof minifySuggestion>;

const importSuggestions = (state: State, suggestions: SuggestionEntity[]) =>
  state.withMutations(state => {
    state.update('items', items => items.concat(suggestions.map(minifySuggestion)));
    state.set('isLoading', false);
  });

const dismissAccount = (state: State, accountId: string) =>
  state.update('items', items => items.filter(item => item.account_id !== accountId));

const dismissAccounts = (state: State, accountIds: string[]) =>
  state.update('items', items => items.filter(item => !accountIds.includes(item.account_id)));

const suggestionsReducer = (state: State = ReducerRecord(), action: AnyAction | DomainBlocksAction) => {
  switch (action.type) {
    case SUGGESTIONS_FETCH_REQUEST:
      return state.set('isLoading', true);
    case SUGGESTIONS_FETCH_SUCCESS:
      return importSuggestions(state, action.suggestions);
    case SUGGESTIONS_FETCH_FAIL:
      return state.set('isLoading', false);
    case ACCOUNT_BLOCK_SUCCESS:
    case ACCOUNT_MUTE_SUCCESS:
      return dismissAccount(state, action.relationship.id);
    case DOMAIN_BLOCK_SUCCESS:
      return dismissAccounts(state, action.accounts);
    default:
      return state;
  }
};

export { suggestionsReducer as default };
