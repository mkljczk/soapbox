import { queryOptions } from '@tanstack/react-query';

import { getClient } from 'pl-fe/api';
import { queryClient } from 'pl-fe/queries/client';

import { mutationOptions } from '../utils/mutation-options';

import type { AdminRule } from 'pl-api';

const rulesQueryOptions = queryOptions({
  queryKey: ['admin', 'rules'],
  queryFn: () => getClient().admin.rules.getRules(),
});

interface CreateRuleParams {
  priority?: number;
  text: string;
  hint?: string;
}

const createRuleMutationOptions = mutationOptions({
  mutationFn: (params: CreateRuleParams) => getClient().admin.rules.createRule(params),
  retry: false,
  onSuccess: (data) =>
    queryClient.setQueryData(['admin', 'rules'], (prevResult: ReadonlyArray<AdminRule>) =>
      [...prevResult, data],
    ),
});

interface UpdateRuleParams {
  id: string;
  priority?: number;
  text?: string;
  hint?: string;
}

const updateRuleMutationOptions = mutationOptions({
  mutationFn: ({ id, ...params }: UpdateRuleParams) => getClient().admin.rules.updateRule(id, params),
  retry: false,
  onSuccess: (data) =>
    queryClient.setQueryData(['admin', 'rules'], (prevResult: ReadonlyArray<AdminRule>) =>
      prevResult.map((rule) => rule.id === data.id ? data : rule),
    ),
});

const deleteRuleMutationOptions = mutationOptions({
  mutationFn: (id: string) => getClient().admin.rules.deleteRule(id),
  retry: false,
  onSuccess: (_, id) =>
    queryClient.setQueryData(['admin', 'rules'], (prevResult: ReadonlyArray<AdminRule>) =>
      prevResult.filter(({ id: ruleId }) => ruleId !== id),
    ),
});

export { rulesQueryOptions, createRuleMutationOptions, updateRuleMutationOptions, deleteRuleMutationOptions };
