import { useMutation, useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { queryClient } from 'pl-fe/queries/client';

import type { AdminRule } from 'pl-api';

interface CreateRuleParams {
  priority?: number;
  text: string;
  hint?: string;
}

interface UpdateRuleParams {
  id: string;
  priority?: number;
  text?: string;
  hint?: string;
}

const useRules = () => {
  const client = useClient();

  const getRules = () => client.admin.rules.getRules();

  const result = useQuery<ReadonlyArray<AdminRule>>({
    queryKey: ['admin', 'rules'],
    queryFn: getRules,
    placeholderData: [],
  });

  const {
    mutate: createRule,
    isPending: isCreating,
  } = useMutation({
    mutationFn: (params: CreateRuleParams) => client.admin.rules.createRule(params),
    retry: false,
    onSuccess: (data) =>
      queryClient.setQueryData(['admin', 'rules'], (prevResult: ReadonlyArray<AdminRule>) =>
        [...prevResult, data],
      ),
  });

  const {
    mutate: updateRule,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: ({ id, ...params }: UpdateRuleParams) => client.admin.rules.updateRule(id, params),
    retry: false,
    onSuccess: (data) =>
      queryClient.setQueryData(['admin', 'rules'], (prevResult: ReadonlyArray<AdminRule>) =>
        prevResult.map((rule) => rule.id === data.id ? data : rule),
      ),
  });

  const {
    mutate: deleteRule,
    isPending: isDeleting,
  } = useMutation({
    mutationFn: (id: string) => client.admin.rules.deleteRule(id),
    retry: false,
    onSuccess: (_, id) =>
      queryClient.setQueryData(['admin', 'rules'], (prevResult: ReadonlyArray<AdminRule>) =>
        prevResult.filter(({ id: ruleId }) => ruleId !== id),
      ),
  });

  return {
    ...result,
    createRule,
    isCreating,
    updateRule,
    isUpdating,
    deleteRule,
    isDeleting,
  };
};

export { useRules };
