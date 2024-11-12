import { createSelector } from 'reselect';

import { Entities } from 'pl-fe/entity-store/entities';
import { useSettingsStore } from 'pl-fe/stores/settings';
import { getDomain } from 'pl-fe/utils/accounts';
import { validId } from 'pl-fe/utils/auth';
import ConfigDB from 'pl-fe/utils/config-db';
import { shouldFilter } from 'pl-fe/utils/timelines';

import type { Account as BaseAccount, MediaAttachment, Relationship } from 'pl-api';
import type { EntityStore } from 'pl-fe/entity-store/types';
import type { Account } from 'pl-fe/normalizers/account';
import type { MinifiedStatus } from 'pl-fe/reducers/statuses';
import type { MRFSimple } from 'pl-fe/schemas/pleroma';
import type { RootState } from 'pl-fe/store';

const selectAccount = (state: RootState, accountId: string) =>
  state.entities[Entities.ACCOUNTS]?.store[accountId] as Account | undefined;

const selectAccounts = (state: RootState, accountIds: Array<string>) =>
  accountIds
    .map(accountId => state.entities[Entities.ACCOUNTS]?.store[accountId] as Account | undefined)
    .filter((account): account is Account => account !== undefined);

const selectOwnAccount = (state: RootState) => {
  if (state.me) {
    return selectAccount(state, state.me);
  }
};

const getAccountBase = (state: RootState, accountId: string) => state.entities[Entities.ACCOUNTS]?.store[accountId] as Account | undefined;
const getAccountRelationship = (state: RootState, accountId: string) => state.entities[Entities.RELATIONSHIPS]?.store[accountId] as Relationship | undefined;
const getAccountMeta = (state: RootState, accountId: string) => state.accounts_meta[accountId];

const makeGetAccount = () => createSelector([
  getAccountBase,
  getAccountRelationship,
  getAccountMeta,
], (account, relationship, meta) => {
  if (!account) return null;
  return {
    ...account,
    relationship,
    __meta: { meta, ...account.__meta },
  };
});

type AccountGalleryAttachment = MediaAttachment & {
  status: MinifiedStatus;
  account: BaseAccount;
}

const getAccountGallery = createSelector([
  (state: RootState, id: string) => state.timelines[`account:${id}:with_replies:media`]?.items || [],
  (state: RootState) => state.statuses,
], (statusIds, statuses) =>
  statusIds.reduce((medias: Array<AccountGalleryAttachment>, statusId: string) => {
    const status = statuses[statusId];
    if (!status) return medias;
    if (status.reblog_id) return medias;

    return medias.concat(
      status.media_attachments.map(media => ({ ...media, status, account: status.account })));
  }, []),
);

const getGroupGallery = createSelector([
  (state: RootState, id: string) => state.timelines[`group:${id}:media`]?.items || [],
  (state: RootState) => state.statuses,
], (statusIds, statuses) =>
  statusIds.reduce((medias: Array<AccountGalleryAttachment>, statusId: string) => {
    const status = statuses[statusId];
    if (!status) return medias;
    if (status.reblog_id) return medias;

    return medias.concat(
      status.media_attachments.map(media => ({ ...media, status, account: status.account })));
  }, []),
);

const makeGetReport = () => createSelector(
  [
    (state: RootState, reportId: string) => state.admin.reports[reportId],
    (state: RootState, reportId: string) => selectAccount(state, state.admin.reports[reportId]?.account_id || ''),
    (state: RootState, reportId: string) => selectAccount(state, state.admin.reports[reportId]?.target_account_id || ''),
    // (state: RootState, reportId: string) =>  state.admin.reports.get(reportId)!.status_ids
    //   .map((statusId) => queryClient.getQueryData() getStatus(state, { id: statusId }))
    //   .filter((status): status !== null),
  ],
  (report, account, target_account/*, statuses */) => {
    if (!report) return null;
    return {
      ...report,
      account,
      target_account,
      // statuses,
    };
  },
);

const getAuthUserIds = createSelector(
  [(state: RootState) => state.auth.users],
  authUsers => Object.values(authUsers).reduce((userIds: Array<string>, authUser) => {
    const userId = authUser?.id;
    if (validId(userId)) userIds.push(userId);
    return userIds;
  }, []));

const makeGetOtherAccounts = () => createSelector([
  (state: RootState) => state.entities[Entities.ACCOUNTS]?.store as EntityStore<Account>,
  getAuthUserIds,
  (state: RootState) => state.me,
], (accounts, authUserIds, me) =>
  authUserIds.reduce<Array<Account>>((list, id) => {
    if (id === me) return list;
    const account = accounts?.[id];
    if (account) list.push(account);
    return list;
  }, []),
);

const getSimplePolicy = createSelector([
  (state: RootState) => state.admin.configs,
  (state: RootState) => state.instance.pleroma.metadata.federation.mrf_simple,
], (configs, instancePolicy) => ({
  ...instancePolicy,
  ...ConfigDB.toSimplePolicy(configs),
}));

const getRemoteInstanceFavicon = (state: RootState, host: string) => {
  const accounts = state.entities[Entities.ACCOUNTS]?.store as EntityStore<Account>;
  const account = Object.entries(accounts).find(([_, account]) => account && getDomain(account) === host)?.[1];
  return account?.favicon || null;
};

type HostFederation = {
  [key in keyof MRFSimple]: boolean;
};

const getRemoteInstanceFederation = (state: RootState, host: string): HostFederation => {
  const simplePolicy = getSimplePolicy(state);

  return Object.fromEntries(
    Object.entries(simplePolicy).map(([key, hosts]) => [key, hosts.includes(host)]),
  ) as HostFederation;
};

const makeGetHosts = () =>
  createSelector([getSimplePolicy], (simplePolicy) => {
    const { accept, reject_deletes, report_removal, ...rest } = simplePolicy;

    return [...new Set(Object.values(rest).reduce((acc, hosts) => (acc.push(...hosts), acc), []))].toSorted();
  });

interface RemoteInstance {
  host: string;
  favicon: string | null;
  federation: HostFederation;
}

const makeGetRemoteInstance = () =>
  createSelector([
    (_state: RootState, host: string) => host,
    getRemoteInstanceFavicon,
    getRemoteInstanceFederation,
  ], (host, favicon, federation): RemoteInstance => ({
    host,
    favicon,
    federation,
  }));

type ColumnQuery = { type: string; prefix?: string };

const makeGetStatusIds = () => createSelector([
  (state: RootState, { type, prefix }: ColumnQuery) => useSettingsStore.getState().settings.timelines[prefix || type],
  (state: RootState, { type }: ColumnQuery) => state.timelines[type]?.items || [],
  (state: RootState) => state.statuses,
], (columnSettings: any, statusIds: Array<string>, statuses) =>
  statusIds.filter((id: string) => {
    const status = statuses[id];
    if (!status) return true;
    return !shouldFilter(status, columnSettings);
  }),
);

export {
  type RemoteInstance,
  selectAccount,
  selectAccounts,
  selectOwnAccount,
  makeGetAccount,
  type AccountGalleryAttachment,
  getAccountGallery,
  getGroupGallery,
  makeGetReport,
  makeGetOtherAccounts,
  makeGetHosts,
  makeGetRemoteInstance,
  makeGetStatusIds,
};
