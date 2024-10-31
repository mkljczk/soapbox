import { instanceSchema } from 'pl-api';
import * as v from 'valibot';

/** Store with registrations open. */
const storeOpen = { instance: v.parse(instanceSchema, { registrations: true }) };

export {
  storeOpen,
};
