import * as v from 'valibot';

import { accountSchema } from './account';

enum GroupRoles {
  OWNER = 'owner',
  ADMIN = 'admin',
  USER = 'user'
}

type GroupRole =`${GroupRoles}`;

/**
 * @category Schemas
 */
const groupMemberSchema = v.object({
  id: v.string(),
  account: accountSchema,
  role: v.enum(GroupRoles),
});

type GroupMember = v.InferOutput<typeof groupMemberSchema>;

export { groupMemberSchema, type GroupMember, GroupRoles, type GroupRole };
