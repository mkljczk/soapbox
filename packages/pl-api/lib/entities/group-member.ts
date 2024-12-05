import * as v from 'valibot';

import { accountSchema } from './account';

enum GroupRoles {
  OWNER = 'owner',
  ADMIN = 'admin',
  USER = 'user'
}

/**
 * @category Entity types
 */
type GroupRole =`${GroupRoles}`;

/**
 * @category Schemas
 */
const groupMemberSchema = v.object({
  id: v.string(),
  account: accountSchema,
  role: v.enum(GroupRoles),
});

/**
 * @category Entity types
 */
type GroupMember = v.InferOutput<typeof groupMemberSchema>;

export { groupMemberSchema, type GroupMember, type GroupRoles, type GroupRole };
