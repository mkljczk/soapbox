import { queryClient } from 'pl-hooks/contexts/query-client';

import { type DeduplicatedNotification, getNotificationStatus, type NormalizedNotification, normalizeNotification } from './normalizers/notification';
import { type NormalizedStatus, normalizeStatus } from './normalizers/status';

import type {
  Account as BaseAccount,
  Group as BaseGroup,
  Poll as BasePoll,
  Relationship as BaseRelationship,
  Status as BaseStatus,
} from 'pl-api';

const importAccount = (account: BaseAccount) => queryClient.setQueryData<BaseAccount>(
  ['accounts', 'entities', account.id], account,
);

const importGroup = (group: BaseGroup) => queryClient.setQueryData<BaseGroup>(
  ['groups', 'entities', group.id], group,
);

const importNotification = (notification: DeduplicatedNotification) => queryClient.setQueryData<NormalizedNotification>(
  ['notifications', 'entities', notification.id],
  existingNotification => existingNotification?.duplicate ? existingNotification : normalizeNotification(notification),
);

const importPoll = (poll: BasePoll) => queryClient.setQueryData<BasePoll>(
  ['polls', 'entities', poll.id], poll,
);

const importRelationship = (relationship: BaseRelationship) => queryClient.setQueryData<BaseRelationship>(
  ['relationships', 'entities', relationship.id], relationship,
);

const importStatus = (status: BaseStatus) => queryClient.setQueryData<NormalizedStatus>(
  ['statuses', 'entities', status.id], normalizeStatus(status),
);

const isEmpty = (object: Record<string, any>) => !Object.values(object).some(value => value);

const importEntities = (entities: {
  accounts?: Array<BaseAccount>;
  groups?: Array<BaseGroup>;
  notifications?: Array<DeduplicatedNotification>;
  polls?: Array<BasePoll>;
  statuses?: Array<BaseStatus>;
  relationships?: Array<BaseRelationship>;
}, options = {
  withParents: true,
}) => {
  const accounts: Record<string, BaseAccount> = {};
  const groups: Record<string, BaseGroup> = {};
  const notifications: Record<string, DeduplicatedNotification> = {};
  const polls: Record<string, BasePoll> = {};
  const relationships: Record<string, BaseRelationship> = {};
  const statuses: Record<string, BaseStatus> = {};

  const processAccount = (account: BaseAccount, withSelf = true) => {
    if (withSelf) accounts[account.id] = account;

    queryClient.setQueryData<string>(['accounts', 'byAcct', account.acct.toLocaleLowerCase()], account.id);

    if (account.moved) processAccount(account.moved);
    if (account.relationship) relationships[account.relationship.id] = account.relationship;
  };

  const processNotification = (notification: DeduplicatedNotification, withSelf = true) => {
    if (withSelf) notifications[notification.id] = notification;

    processAccount(notification.account);
    if (notification.type === 'move') processAccount(notification.target);

    const status = getNotificationStatus(notification);
    if (status) {
      processStatus(status);
    }
  };

  const processStatus = (status: BaseStatus, withSelf = true) => {
    if (withSelf) statuses[status.id] = status;

    if (status.account) {
      processAccount(status.account);
    }

    if (status.quote) processStatus(status.quote);
    if (status.reblog) processStatus(status.reblog);
    if (status.poll) polls[status.poll.id] = status.poll;
    if (status.group) groups[status.group.id] = status.group;
  };

  if (options.withParents) {
    entities.groups?.forEach(group => groups[group.id] = group);
    entities.polls?.forEach(poll => polls[poll.id] = poll);
    entities.relationships?.forEach(relationship => relationships[relationship.id] = relationship);
  }

  entities.accounts?.forEach((account) => processAccount(account, options.withParents));
  entities.notifications?.forEach((notification) => processNotification(notification, options.withParents));
  entities.statuses?.forEach((status) => processStatus(status, options.withParents));

  if (!isEmpty(accounts)) Object.values(accounts).forEach(importAccount);
  if (!isEmpty(groups)) Object.values(groups).forEach(importGroup);
  if (!isEmpty(notifications)) Object.values(notifications).forEach(importNotification);
  if (!isEmpty(polls)) Object.values(polls).forEach(importPoll);
  if (!isEmpty(relationships)) Object.values(relationships).forEach(importRelationship);
  if (!isEmpty(statuses)) Object.values(statuses).forEach(importStatus);
};

export { importEntities };
