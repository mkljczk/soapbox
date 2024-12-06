import { importEntities as importEntityStoreEntities } from 'pl-fe/entity-store/actions';
import { Entities } from 'pl-fe/entity-store/entities';
import { normalizeGroup } from 'pl-fe/normalizers/group';

import type { Account as BaseAccount, Group as BaseGroup, Poll as BasePoll, Relationship as BaseRelationship, Status as BaseStatus } from 'pl-api';
import type { AppDispatch } from 'pl-fe/store';

const STATUS_IMPORT = 'STATUS_IMPORT' as const;
const STATUSES_IMPORT = 'STATUSES_IMPORT' as const;
const POLLS_IMPORT = 'POLLS_IMPORT' as const;

// Sometimes Pleroma can return an empty account,
// or a repost can appear of a deleted account. Skip these statuses.
const isBroken = (status: BaseStatus) => {
  try {
    if (status.scheduled_at !== null) return true;
    // Skip empty accounts
    // https://gitlab.com/soapbox-pub/soapbox/-/issues/424
    if (!status.account.id) return true;
    // Skip broken reposts
    // https://gitlab.com/soapbox-pub/rebased/-/issues/28
    if (status.reblog && !status.reblog.account.id) return true;
    return false;
  } catch (e) {
    return true;
  }
};

const isEmpty = (object: Record<string, any>) => !Object.values(object).some(value => value);

interface ImportStatusAction {
  type: typeof STATUS_IMPORT;
  status: BaseStatus;
  idempotencyKey?: string;
}

interface ImportStatusesAction {
  type: typeof STATUSES_IMPORT;
  statuses: Array<BaseStatus>;
}

interface ImportPollAction {
  type: typeof POLLS_IMPORT;
  polls: Array<BasePoll>;
}

const importEntities = (entities: {
  accounts?: Array<BaseAccount | undefined | null>;
  groups?: Array<BaseGroup | undefined | null>;
  polls?: Array<BasePoll | undefined | null>;
  statuses?: Array<BaseStatus & { expectsCard?: boolean } | undefined | null>;
  relationships?: Array<BaseRelationship | undefined | null>;
}, options: {
  withParents?: boolean;
  idempotencyKey?: string;
} = {
  withParents: true,
}) => (dispatch: AppDispatch) => {
  const accounts: Record<string, BaseAccount> = {};
  const groups: Record<string, BaseGroup> = {};
  const polls: Record<string, BasePoll> = {};
  const relationships: Record<string, BaseRelationship> = {};
  const statuses: Record<string, BaseStatus> = {};

  const processAccount = (account: BaseAccount, withSelf = true) => {
    if (withSelf) accounts[account.id] = account;

    if (account.moved) processAccount(account.moved);
    if (account.relationship) relationships[account.relationship.id] = account.relationship;
  };

  const processStatus = (status: BaseStatus, withSelf = true) => {
    // Skip broken statuses
    if (isBroken(status)) return;

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
    entities.groups?.forEach(group => group && (groups[group.id] = group));
    entities.polls?.forEach(poll => poll && (polls[poll.id] = poll));
    entities.relationships?.forEach(relationship => relationship && (relationships[relationship.id] = relationship));
  }

  entities.accounts?.forEach((account) => account && processAccount(account, options.withParents));

  if (entities.statuses?.length === 1 && entities.statuses[0] && options.idempotencyKey) {
    dispatch<ImportStatusAction>({
      type: STATUS_IMPORT,
      status: entities.statuses[0], idempotencyKey: options.idempotencyKey,
    });
    processStatus(entities.statuses[0], false);
  } else {
    entities.statuses?.forEach((status) => status && processStatus(status, options.withParents));
  }

  if (!isEmpty(accounts)) dispatch(importEntityStoreEntities(Object.values(accounts), Entities.ACCOUNTS));
  if (!isEmpty(groups)) dispatch(importEntityStoreEntities(Object.values(groups).map(normalizeGroup), Entities.GROUPS));
  if (!isEmpty(polls)) dispatch<ImportPollAction>(({ type: POLLS_IMPORT, polls: Object.values(polls) }));
  if (!isEmpty(relationships)) dispatch(importEntityStoreEntities(Object.values(relationships), Entities.RELATIONSHIPS));
  if (!isEmpty(statuses)) dispatch<ImportStatusesAction>({ type: STATUSES_IMPORT, statuses: Object.values(statuses) });
};

type ImporterAction = ImportStatusAction | ImportStatusesAction | ImportPollAction;

export {
  STATUS_IMPORT,
  STATUSES_IMPORT,
  POLLS_IMPORT,
  importEntities,
  type ImporterAction,
};
