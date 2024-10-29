import * as v from 'valibot';

import { accountSchema } from './account';
import { filteredArray } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/FamiliarFollowers/}
 */
const familiarFollowersSchema = v.object({
  id: v.string(),
  accounts: filteredArray(accountSchema),
});

type FamiliarFollowers = v.InferOutput<typeof familiarFollowersSchema>

export { familiarFollowersSchema, type FamiliarFollowers };
