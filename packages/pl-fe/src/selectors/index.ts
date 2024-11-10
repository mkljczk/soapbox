import { createSelector } from 'reselect';

// import { getLocale } from 'pl-fe/actions/settings';
import { Entities } from 'pl-fe/entity-store/entities';
import { useSettingsStore } from 'pl-fe/stores/settings';
import { getDomain } from 'pl-fe/utils/accounts';
import { validId } from 'pl-fe/utils/auth';
import ConfigDB from 'pl-fe/utils/config-db';
import { shouldFilter } from 'pl-fe/utils/timelines';

import type { Account as BaseAccount, Filter, MediaAttachment, NotificationGroup, Relationship } from 'pl-api';
import type { EntityStore } from 'pl-fe/entity-store/types';
import type { Account } from 'pl-fe/normalizers/account';
import type { Group } from 'pl-fe/normalizers/group';
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

type SelectedAccount = Exclude<ReturnType<ReturnType<typeof makeGetAccount>>, null>;

const toServerSideType = (columnType: string): Filter['context'][0] => {
  switch (columnType) {
    case 'home':
    case 'notifications':
    case 'public':
    case 'thread':
      return columnType;
    default:
      if (columnType.includes('list:')) {
        return 'home';
      } else {
        return 'public'; // community, account, hashtag
      }
  }
};

type FilterContext = { contextType?: string };

const getFilters = (state: RootState, query: FilterContext) =>
  state.filters.filter((filter) =>
    (!query?.contextType || filter.context.includes(toServerSideType(query.contextType)))
      && (filter.expires_at === null || Date.parse(filter.expires_at) > new Date().getTime()),
  );

const escapeRegExp = (string: string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

const regexFromFilters = (filters: Array<Filter>) => {
  if (filters.length === 0) return null;

  return new RegExp(filters.map(filter =>
    filter.keywords.map(keyword => {
      let expr = escapeRegExp(keyword.keyword);

      if (keyword.whole_word) {
        if (/^[\w]/.test(expr)) {
          expr = `\\b${expr}`;
        }

        if (/[\w]$/.test(expr)) {
          expr = `${expr}\\b`;
        }
      }

      return expr;
    }).join('|'),
  ).join('|'), 'i');
};

const checkFiltered = (index: string, filters: Array<Filter>) =>
  filters.reduce((result: Array<string>, filter) =>
    result.concat(filter.keywords.reduce((result: Array<string>, keyword) => {
      let expr = escapeRegExp(keyword.keyword);

      if (keyword.whole_word) {
        if (/^[\w]/.test(expr)) {
          expr = `\\b${expr}`;
        }

        if (/[\w]$/.test(expr)) {
          expr = `${expr}\\b`;
        }
      }

      const regex = new RegExp(expr);

      if (regex.test(index)) return result.concat(filter.title);
      return result;
    }, [])), []);

type APIStatus = { id: string; username?: string };

const makeGetStatus = () => createSelector(
  [
    (state: RootState, { id }: APIStatus) => state.statuses[id],
    (state: RootState, { id }: APIStatus) => state.statuses[state.statuses[id]?.reblog_id || ''] || null,
    (state: RootState, { id }: APIStatus) => state.statuses[state.statuses[id]?.quote_id || ''] || null,
    (state: RootState, { id }: APIStatus) => {
      const group = state.statuses[id]?.group_id;
      if (group) return state.entities[Entities.GROUPS]?.store[group] as Group;
      return undefined;
    },
    (state: RootState, { id }: APIStatus) => state.polls[id] || null,
    (_state: RootState, { username }: APIStatus) => username,
    getFilters,
    (state: RootState) => state.me,
    (state: RootState) => state.auth.client.features,
  ],

  (statusBase, statusReblog, statusQuote, statusGroup, poll, username, filters, me, features) => {
    // const locale = getLocale('en');

    if (!statusBase) return null;
    const { account } = statusBase;
    const accountUsername = account.acct;

    // Must be owner of status if username exists.
    if (accountUsername !== username && username !== undefined) {
      return null;
    }

    const filtered = features.filtersV2
      ? statusBase.filtered
      : features.filters && account.id !== me && checkFiltered(statusReblog?.search_index || statusBase.search_index || '', filters) || [];

    return {
      ...statusBase,
      reblog: statusReblog || null,
      quote: statusQuote || null,
      group: statusGroup || null,
      poll,
      filtered,
    };
    // if (map.currentLanguage === null && map.content_map?.size) {
    //   let currentLanguage: string | null = null;
    //   if (map.content_map.has(locale)) currentLanguage = locale;
    //   else if (map.language && map.content_map.has(map.language)) currentLanguage = map.language;
    //   else currentLanguage = map.content_map.keySeq().first();
    //   map.set('currentLanguage', currentLanguage);
    // }
  },
);

type SelectedStatus = Exclude<ReturnType<ReturnType<typeof makeGetStatus>>, null>;

const makeGetNotification = () => createSelector([
  (_state: RootState, notification: NotificationGroup) => notification,
  // @ts-ignore
  (state: RootState, notification: NotificationGroup) => selectAccount(state, notification.target_id),
  // @ts-ignore
  (state: RootState, notification: NotificationGroup) => state.statuses[notification.status_id],
  (state: RootState, notification: NotificationGroup) => selectAccounts(state, notification.sample_account_ids),
], (notification, target, status, accounts): SelectedNotification => ({
  ...notification,
  // @ts-ignore
  target,
  // @ts-ignore
  status,
  accounts,
}));

type SelectedNotification = NotificationGroup & {
  accounts: Array<Account>;
} & ({
  type: 'follow' | 'follow_request' | 'admin.sign_up' | 'bite';
} | {
  type: 'status' | 'mention' | 'reblog' | 'favourite' | 'poll' | 'update' | 'emoji_reaction' | 'event_reminder' | 'participation_accepted' | 'participation_request';
  status: MinifiedStatus;
} | {
  type: 'move';
  target: Account;
})

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

const makeGetReport = () => {
  const getStatus = makeGetStatus();

  return createSelector(
    [
      (state: RootState, reportId: string) => state.admin.reports[reportId],
      (state: RootState, reportId: string) => selectAccount(state, state.admin.reports[reportId]?.account_id || ''),
      (state: RootState, reportId: string) => selectAccount(state, state.admin.reports[reportId]?.target_account_id || ''),
      (state: RootState, reportId: string) => state.admin.reports[reportId]!.status_ids
        .map((statusId) => getStatus(state, { id: statusId }))
        .filter((status): status is SelectedStatus => status !== null),
    ],
    (report, account, target_account, statuses) => {
      if (!report) return null;
      return {
        ...report,
        account,
        target_account,
        statuses,
      };
    },
  );
};

const getAuthUserIds = createSelector(
  [(state: RootState) => state.auth.users],
  authUsers => authUsers.reduce((userIds: Array<string>, authUser) => {
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
  type SelectedAccount,
  getFilters,
  regexFromFilters,
  makeGetStatus,
  type SelectedStatus,
  makeGetNotification,
  type SelectedNotification,
  type AccountGalleryAttachment,
  getAccountGallery,
  getGroupGallery,
  makeGetReport,
  makeGetOtherAccounts,
  makeGetHosts,
  makeGetRemoteInstance,
  makeGetStatusIds,
};
