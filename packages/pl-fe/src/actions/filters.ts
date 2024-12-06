import { defineMessages } from 'react-intl';

import toast from 'pl-fe/toast';
import { isLoggedIn } from 'pl-fe/utils/auth';

import { getClient } from '../api';

import type { Filter, FilterContext } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const FILTERS_FETCH_SUCCESS = 'FILTERS_FETCH_SUCCESS' as const;

const messages = defineMessages({
  added: { id: 'filters.added', defaultMessage: 'Filter added.' },
  removed: { id: 'filters.removed', defaultMessage: 'Filter deleted.' },
});

type FilterKeywords = { keyword: string; whole_word: boolean }[];

const fetchFilters = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    return getClient(getState).filtering.getFilters()
      .then((data) => ({
        filters: data,
      }))
      .catch(error => ({
        error,
      }));
  };

const fetchFilter = (filterId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).filtering.getFilter(filterId);

const createFilter = (title: string, expires_in: number | undefined, context: Array<FilterContext>, hide: boolean, keywords_attributes: FilterKeywords) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).filtering.createFilter({
      title,
      context,
      filter_action: hide ? 'hide' : 'warn',
      expires_in,
      keywords_attributes,
    }).then(response => {
      toast.success(messages.added);

      return response;
    });

const updateFilter = (filterId: string, title: string, expires_in: number | undefined, context: Array<FilterContext>, hide: boolean, keywords_attributes: FilterKeywords) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).filtering.updateFilter(filterId, {
      title,
      context,
      filter_action: hide ? 'hide' : 'warn',
      expires_in,
      keywords_attributes,
    }).then(response => {
      toast.success(messages.added);

      return response;
    });

const deleteFilter = (filterId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).filtering.deleteFilter(filterId).then(response => {
      toast.success(messages.removed);

      return response;
    });

type FiltersAction = { type: typeof FILTERS_FETCH_SUCCESS; filters: Array<Filter> };

export {
  FILTERS_FETCH_SUCCESS,
  fetchFilters,
  fetchFilter,
  createFilter,
  updateFilter,
  deleteFilter,
  type FiltersAction,
};
