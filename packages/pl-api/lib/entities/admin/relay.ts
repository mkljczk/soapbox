import * as v from 'valibot';

const adminRelaySchema = v.pipe(
  v.any(),
  v.transform((data: any) => ({ id: data.actor, ...data })),
  v.object({
    actor: v.fallback(v.string(), ''),
    id: v.string(),
    followed_back: v.fallback(v.boolean(), false),
  }),
);

type AdminRelay = v.InferOutput<typeof adminRelaySchema>

export { adminRelaySchema, type AdminRelay };
