import * as v from 'valibot';

/**
 * @category Admin schemas
 * @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminmoderation_log}
 */
const adminModerationLogEntrySchema = v.object({
  id: v.pipe(v.unknown(), v.transform(String)),
  data: v.fallback(v.record(v.string(), v.any()), {}),
  time: v.fallback(v.number(), 0),
  message: v.fallback(v.string(), ''),
});

/**
 * @category Admin types
 */
type AdminModerationLogEntry = v.InferOutput<typeof adminModerationLogEntrySchema>

export { adminModerationLogEntrySchema, type AdminModerationLogEntry };
