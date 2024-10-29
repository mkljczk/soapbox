import * as v from 'valibot';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/DomainBlock}
 */
const domainBlockSchema = v.object({
  domain: v.string(),
  digest: v.string(),
  severity: v.picklist(['silence', 'suspend']),
  comment: v.fallback(v.optional(v.string()), undefined),
});

type DomainBlock = v.InferOutput<typeof domainBlockSchema>;

export { domainBlockSchema, type DomainBlock };
