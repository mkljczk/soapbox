import * as v from 'valibot';

import { accountSchema } from './account';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/Suggestion}
 */
const suggestionSchema = v.pipe(
  v.any(),
  v.transform((suggestion: any) => {
  /**
   * Support `/api/v1/suggestions`
   * @see {@link https://docs.joinmastodon.org/methods/suggestions/#v1}
  */
    if (!suggestion) return null;

    if (suggestion?.acct) return {
      source: 'staff',
      sources: ['featured'],
      account: suggestion,
    };

    if (!suggestion.sources) {
      suggestion.sources = [];
      switch (suggestion.source) {
        case 'staff':
          suggestion.sources.push('staff');
          break;
        case 'global':
          suggestion.sources.push('most_interactions');
          break;
      }
    }

    return suggestion;
  }),
  v.object({
    source: v.fallback(v.nullable(v.string()), null),
    sources: v.fallback(v.array(v.string()), []),
    account: accountSchema,
  }),
);

/**
 * @category Entity types
 */
type Suggestion = v.InferOutput<typeof suggestionSchema>;

export { suggestionSchema, type Suggestion };
