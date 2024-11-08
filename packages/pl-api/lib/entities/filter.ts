import * as v from 'valibot';

import { datetimeSchema, filteredArray } from './utils';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/FilterKeyword/}
 */
const filterKeywordSchema = v.object({
  id: v.string(),
  keyword: v.string(),
  whole_word: v.boolean(),
});

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/FilterStatus/}
 */
const filterStatusSchema = v.object({
  id: v.string(),
  status_id: v.string(),
});

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Filter/}
 */
const filterSchema = v.pipe(
  v.any(),
  v.transform((filter: any) => {
    if (filter.phrase) {
      return {
        ...filter,
        title: filter.phrase,
        keywords: [{
          id: '1',
          keyword: filter.phrase,
          whole_word: filter.whole_word,
        }],
        filter_action: filter.irreversible ? 'hide' : 'warn',
      };
    }
    return filter;
  }),
  v.object({
    id: v.string(),
    title: v.string(),
    context: v.array(v.picklist(['home', 'notifications', 'public', 'thread', 'account'])),
    expires_at: v.fallback(v.nullable(datetimeSchema), null),
    filter_action: v.fallback(v.picklist(['warn', 'hide']), 'warn'),
    keywords: filteredArray(filterKeywordSchema),
    statuses: filteredArray(filterStatusSchema),
  }),
);

type Filter = v.InferOutput<typeof filterSchema>;

export { filterKeywordSchema, filterStatusSchema, filterSchema, type Filter };
