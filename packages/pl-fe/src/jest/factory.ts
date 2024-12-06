import {
  accountSchema,
  groupMemberSchema,
  groupRelationshipSchema,
  groupSchema,
  instanceSchema,
  relationshipSchema,
  statusSchema,
  GroupRoles,
  type Account,
  type Group,
  type GroupMember,
  type GroupRelationship,
  type Instance,
  type Relationship,
  type Status,
} from 'pl-api';
import * as v from 'valibot';

import type { PartialDeep } from 'type-fest';

// TODO: there's probably a better way to create these factory functions.
// This looks promising but didn't work on my first attempt: https://github.com/anatine/zod-plugins/tree/main/packages/zod-mock

const buildAccount = (props: PartialDeep<Account> = {}): Account =>
  v.parse(accountSchema, Object.assign({
    id: crypto.randomUUID(),
    url: `https://soapbox.test/users/${crypto.randomUUID()}`,
  }, props));

const buildGroup = (props: PartialDeep<Group> = {}): Group =>
  v.parse(groupSchema, Object.assign({
    id: crypto.randomUUID(),
    owner: {
      id: crypto.randomUUID(),
    },
  }, props));

const buildGroupRelationship = (props: PartialDeep<GroupRelationship> = {}): GroupRelationship =>
  v.parse(groupRelationshipSchema, Object.assign({
    id: crypto.randomUUID(),
  }, props));

const buildGroupMember = (
  props: PartialDeep<GroupMember> = {},
  accountProps: PartialDeep<Account> = {},
): GroupMember => v.parse(groupMemberSchema, Object.assign({
  id: crypto.randomUUID(),
  account: buildAccount(accountProps),
  role: GroupRoles.USER,
}, props));

const buildInstance = (props: PartialDeep<Instance> = {}) => v.parse(instanceSchema, props);

const buildRelationship = (props: PartialDeep<Relationship> = {}): Relationship =>
  v.parse(relationshipSchema, Object.assign({
    id: crypto.randomUUID(),
  }, props));

const buildStatus = (props: PartialDeep<Status> = {}) =>
  v.parse(statusSchema, Object.assign({
    id: crypto.randomUUID(),
    account: buildAccount(),
  }, props));

export {
  buildAccount,
  buildGroup,
  buildGroupMember,
  buildGroupRelationship,
  buildInstance,
  buildRelationship,
  buildStatus,
};
