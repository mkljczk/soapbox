import {
  Map as ImmutableMap,
  List as ImmutableList,
  Set as ImmutableSet,
} from 'immutable';
import trimStart from 'lodash/trimStart';
import * as v from 'valibot';

import { mrfSimpleSchema } from 'pl-fe/schemas/pleroma';

type Config = ImmutableMap<string, any>;
type Policy = Record<string, any>;

const find = (
  configs: ImmutableList<Config>,
  group: string,
  key: string,
): Config | undefined => configs.find(config =>
  config.isSuperset(ImmutableMap({ group, key })),
);

const toSimplePolicy = (configs: ImmutableList<Config>) => {
  const config = find(configs, ':pleroma', ':mrf_simple');

  const reducer = (acc: ImmutableMap<string, any>, curr: ImmutableMap<string, any>) => {
    const key = curr.getIn(['tuple', 0]) as string;
    const hosts = curr.getIn(['tuple', 1]) as ImmutableList<string>;
    return acc.set(trimStart(key, ':'), ImmutableSet(hosts));
  };

  if (config?.get) {
    const value = config.get('value', ImmutableList());
    const result = value.reduce(reducer, ImmutableMap());
    return v.parse(mrfSimpleSchema, result.toJS());
  } else {
    return v.parse(mrfSimpleSchema, {});
  }
};

const fromSimplePolicy = (simplePolicy: Policy) => {
  const mapper = ([key, hosts]: [key: string, hosts: ImmutableList<string>]) => ({ tuple: [`:${key}`, hosts] });

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
