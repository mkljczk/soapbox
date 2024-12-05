import { Entities } from 'pl-fe/entity-store/entities';
import { queryClient } from 'pl-fe/queries/client';
import { isLoggedIn } from 'pl-fe/utils/auth';

import { getClient } from '../api';

import type { PaginatedResponse } from 'pl-api';
import type { EntityStore } from 'pl-fe/entity-store/types';
import type { Account } from 'pl-fe/normalizers/account';
import type { MinifiedSuggestion } from 'pl-fe/queries/trends/use-suggested-accounts';
import type { AppDispatch, RootState } from 'pl-fe/store';

const DOMAIN_UNBLOCK_SUCCESS = 'DOMAIN_UNBLOCK_SUCCESS' as const;

const DOMAIN_BLOCKS_FETCH_SUCCESS = 'DOMAIN_BLOCKS_FETCH_SUCCESS' as const;

const DOMAIN_BLOCKS_EXPAND_SUCCESS = 'DOMAIN_BLOCKS_EXPAND_SUCCESS' as const;

const blockDomain = (domain: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    return getClient(getState).filtering.blockDomain(domain).then(() => {
      // TODO: Update relationships on block
      const accounts = selectAccountsByDomain(getState(), domain);
      if (!accounts) return;

      queryClient.setQueryData<Array<MinifiedSuggestion>>(['suggestions'], suggestions => suggestions
        ? suggestions.filter((suggestion) => !accounts.includes(suggestion.account_id))
        : undefined);
    });
  };

const unblockDomain = (domain: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    return getClient(getState).filtering.unblockDomain(domain).then(() => {
      // TODO: Update relationships on unblock
      const accounts = selectAccountsByDomain(getState(), domain);
      if (!accounts) return;
      dispatch(unblockDomainSuccess(domain, accounts));
    }).catch(() => {});
  };

const unblockDomainSuccess = (domain: string, accounts: string[]) => ({
  type: DOMAIN_UNBLOCK_SUCCESS,
  domain,
  accounts,
});

const fetchDomainBlocks = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    return getClient(getState).filtering.getDomainBlocks().then(response => {
      dispatch(fetchDomainBlocksSuccess(response.items, response.next));
    });
  };

const fetchDomainBlocksSuccess = (domains: string[], next: (() => Promise<PaginatedResponse<string>>) | null) => ({
  type: DOMAIN_BLOCKS_FETCH_SUCCESS,
  domains,
  next,
});

const expandDomainBlocks = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const next = getState().domain_lists.blocks.next;

    if (!next) return;

    next().then(response => {
      dispatch(expandDomainBlocksSuccess(response.items, response.next));
    }).catch(() => {});
  };

const selectAccountsByDomain = (state: RootState, domain: string): string[] => {
  const store = state.entities[Entities.ACCOUNTS]?.store as EntityStore<Account> | undefined;
  const entries = store ? Object.entries(store) : undefined;
  const accounts = entries
    ?.filter(([_, item]) => item && item.acct.endsWith(`@${domain}`))
    .map(([_, item]) => item!.id);
  return accounts || [];
};

const expandDomainBlocksSuccess = (domains: string[], next: (() => Promise<PaginatedResponse<string>>) | null) => ({
  type: DOMAIN_BLOCKS_EXPAND_SUCCESS,
  domains,
  next,
});

type DomainBlocksAction =
  | ReturnType<typeof unblockDomainSuccess>
  | ReturnType<typeof fetchDomainBlocksSuccess>
  | ReturnType<typeof expandDomainBlocksSuccess>;

export {
  DOMAIN_UNBLOCK_SUCCESS,
  DOMAIN_BLOCKS_FETCH_SUCCESS,
  DOMAIN_BLOCKS_EXPAND_SUCCESS,
  blockDomain,
  unblockDomain,
  fetchDomainBlocks,
  expandDomainBlocks,
  type DomainBlocksAction,
};
