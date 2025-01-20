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
const groupMemberSchema = v.pipe(v.any(), v.transform((groupMember: any) => {
  if (!groupMember.account) {
    return {
      id: groupMember.id,
      account: groupMember,
      role: {
        founder: 'owner',
        admin: 'admin',
      }[groupMember.role as string] || 'user',
    };
  }
}), v.object({
  id: v.string(),
  account: accountSchema,
  role: v.enum(GroupRoles),
}));

/**
 * @category Entity types
 */
type GroupMember = v.InferOutput<typeof groupMemberSchema>;

export { groupMemberSchema, type GroupMember, GroupRoles, type GroupRole };
