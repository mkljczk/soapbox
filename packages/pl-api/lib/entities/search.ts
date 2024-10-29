import * as v from 'valibot';

import { accountSchema } from './account';
import { groupSchema } from './group';
import { statusSchema } from './status';
import { tagSchema } from './tag';
import { filteredArray } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Search}
 */
const searchSchema = v.object({
  accounts: filteredArray(accountSchema),
  statuses: filteredArray(statusSchema),
  hashtags: filteredArray(tagSchema),
  groups: filteredArray(groupSchema),
});

type Search = v.InferOutput<typeof searchSchema>;

export { searchSchema, type Search };
