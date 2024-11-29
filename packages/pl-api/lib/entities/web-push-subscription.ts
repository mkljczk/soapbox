import * as v from 'valibot';

/**
 * @category Schemas
 * @see {@link https://docs.joinmastodon.org/entities/WebPushSubscription/}
 */
const webPushSubscriptionSchema = v.object({
  id: v.pipe(v.unknown(), v.transform(String)),
  endpoint: v.string(),
  alerts: v.record(v.string(), v.boolean()),
  server_key: v.string(),
});

/**
 * @category Entity types
 */
type WebPushSubscription = v.InferOutput<typeof webPushSubscriptionSchema>;

export { webPushSubscriptionSchema, type WebPushSubscription };
