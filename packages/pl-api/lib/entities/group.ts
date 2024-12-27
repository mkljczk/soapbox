import * as v from 'valibot';

import { customEmojiSchema } from './custom-emoji';
import { groupRelationshipSchema } from './group-relationship';
import { datetimeSchema, filteredArray } from './utils';

/**
 * @category Schemas
 */
const groupSchema = v.pipe(v.any(), v.transform((group: any) => {
  if (group.config) {
    return {
      display_name: group.name,
      members_count: group.member_count,
      note: group.short_description,
      relationship: group.self ? {
        ...group.self,
        member: group.self.is_member,
        role: {
          founder: 'owner',
          admin: 'admin',
        }[group.self.role as string] || 'user',
        id: group.id,
      } : null,
      ...group,
    };
  }
  return group;
}), v.object({
  avatar: v.fallback(v.string(), ''),
  avatar_static: v.fallback(v.string(), ''),
  created_at: v.fallback(datetimeSchema, new Date().toISOString()),
  display_name: v.fallback(v.string(), ''),
  domain: v.fallback(v.string(), ''),
  emojis: filteredArray(customEmojiSchema),
  header: v.fallback(v.string(), ''),
  header_static: v.fallback(v.string(), ''),
  id: v.pipe(v.unknown(), v.transform(String)),
  locked: v.fallback(v.boolean(), false),
  membership_required: v.fallback(v.boolean(), false),
  members_count: v.fallback(v.number(), 0),
  owner: v.fallback(v.nullable(v.object({ id: v.string() })), null),
  note: v.fallback(v.pipe(v.string(), v.transform(note => note === '<p></p>' ? '' : note)), ''),
  relationship: v.fallback(v.nullable(groupRelationshipSchema), null),
  statuses_visibility: v.fallback(v.string(), 'public'),
  uri: v.fallback(v.string(), ''),
  url: v.fallback(v.string(), ''),

  avatar_description: v.fallback(v.string(), ''),
  header_description: v.fallback(v.string(), ''),
}));

/**
 * @category Entity types
 */
type Group = v.InferOutput<typeof groupSchema>;

export { groupSchema, type Group };
