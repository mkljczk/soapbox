import { importEntities } from 'pl-hooks';

import { getClient } from 'pl-fe/api';

import { fetchRelationships } from './accounts';
import { insertSuggestionsIntoTimeline } from './timelines';

import type { Suggestion } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const SUGGESTIONS_FETCH_REQUEST = 'SUGGESTIONS_FETCH_REQUEST' as const;
const SUGGESTIONS_FETCH_SUCCESS = 'SUGGESTIONS_FETCH_SUCCESS' as const;
const SUGGESTIONS_FETCH_FAIL = 'SUGGESTIONS_FETCH_FAIL' as const;

interface SuggestionsFetchRequestAction {
  type: typeof SUGGESTIONS_FETCH_REQUEST;
}

interface SuggestionsFetchSuccessAction {
  type: typeof SUGGESTIONS_FETCH_SUCCESS;
  suggestions: Array<Suggestion>;
}

interface SuggestionsFetchFailAction {
  type: typeof SUGGESTIONS_FETCH_FAIL;
  error: any;
  skipAlert: true;
}

const fetchSuggestions = (limit = 50) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const client = getClient(state);
    const me = state.me;

    if (!me) return null;

    if (client.features.suggestions) {
      dispatch<SuggestionsFetchRequestAction>({ type: SUGGESTIONS_FETCH_REQUEST });

      return getClient(getState).myAccount.getSuggestions(limit).then((suggestions) => {
        const accounts = suggestions.map(({ account }) => account);

        importEntities({ accounts });
        dispatch<SuggestionsFetchSuccessAction>({ type: SUGGESTIONS_FETCH_SUCCESS, suggestions });

        dispatch(fetchRelationships(accounts.map(({ id }) => id)));
        return suggestions;
      }).catch(error => {
        dispatch<SuggestionsFetchFailAction>({ type: SUGGESTIONS_FETCH_FAIL, error, skipAlert: true });
        throw error;
      });
    } else {
      // Do nothing
      return null;
    }
  };

const fetchSuggestionsForTimeline = () => (dispatch: AppDispatch) => {
  dispatch(fetchSuggestions(20))?.then(() => dispatch(insertSuggestionsIntoTimeline()));
};

type SuggestionsAction =
  | SuggestionsFetchRequestAction
  | SuggestionsFetchSuccessAction
  | SuggestionsFetchFailAction;

export {
  SUGGESTIONS_FETCH_REQUEST,
  SUGGESTIONS_FETCH_SUCCESS,
  SUGGESTIONS_FETCH_FAIL,
  fetchSuggestions,
  fetchSuggestionsForTimeline,
  type SuggestionsAction,
};
