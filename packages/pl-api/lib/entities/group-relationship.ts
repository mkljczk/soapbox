import * as v from 'valibot';

import { GroupRoles } from './group-member';

/**
 * @category Schemas
 */
const groupRelationshipSchema = v.object({
  id: v.string(),
  member: v.fallback(v.boolean(), false),
  role: v.fallback(v.enum(GroupRoles), GroupRoles.USER),
  requested: v.fallback(v.boolean(), false),
});

/**
 * @category Entity types
 */
type GroupRelationship = v.InferOutput<typeof groupRelationshipSchema>;

export { groupRelationshipSchema, type GroupRelationship };
