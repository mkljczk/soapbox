import { instanceSchema } from 'pl-api';
import * as v from 'valibot';

const initialState = v.parse(instanceSchema, {});

const instance = () => initialState;

export { instance as default };
