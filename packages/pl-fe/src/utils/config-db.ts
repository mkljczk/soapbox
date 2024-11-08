import trimStart from 'lodash/trimStart';
import * as v from 'valibot';

import { mrfSimpleSchema } from 'pl-fe/schemas/pleroma';

import type { PleromaConfig } from 'pl-api';

type Policy = Record<string, any>;
type Config = PleromaConfig['configs'][0];

const find = (
  configs: PleromaConfig['configs'],
  group: string,
  key: string,
): Config | undefined => configs.find(config =>
  config.group === group && config.key === key,
);

const toSimplePolicy = (configs: PleromaConfig['configs']) => {
  const config = find(configs, ':pleroma', ':mrf_simple');

  const reducer = (acc: Record<string, any>, curr: Record<string, any>) => {
    const key = curr.tuple?.[0] as string;
    const hosts = curr.tuple?.[1] as Array<string>;
    return acc[trimStart(key, ':')] = hosts;
  };

  if (config) {
    const value = config.value || [];
    const result = value.reduce(reducer, {});
    return v.parse(mrfSimpleSchema, result);
  } else {
    return v.parse(mrfSimpleSchema, {});
  }
};

const fromSimplePolicy = (simplePolicy: Policy) => {
  const mapper = ([key, hosts]: [key: string, hosts: Array<string>]) => ({ tuple: [`:${key}`, hosts] });

  const value = Object.entries(simplePolicy).map(mapper);

  return [
    {
      group: ':pleroma',
      key: ':mrf_simple',
      value: value,
    },
  ];
};

const ConfigDB = {
  find,
  toSimplePolicy,
  fromSimplePolicy,
};

export { type Config, ConfigDB as default };
