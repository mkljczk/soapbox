import { useMutation, useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { queryClient } from 'pl-fe/queries/client';

import type { AdminDomain } from 'pl-api';

interface CreateDomainParams {
  domain: string;
  public: boolean;
}

interface UpdateDomainParams {
  id: string;
  public: boolean;
}

const useDomains = () => {
  const client = useClient();

  const getDomains = () => client.admin.domains.getDomains();

  const result = useQuery<ReadonlyArray<AdminDomain>>({
    queryKey: ['admin', 'domains'],
    queryFn: getDomains,
    placeholderData: [],
  });

  const {
    mutate: createDomain,
    isPending: isCreating,
  } = useMutation({
    mutationFn: (params: CreateDomainParams) => client.admin.domains.createDomain(params),
    retry: false,
    onSuccess: (data) =>
      queryClient.setQueryData(['admin', 'domains'], (prevResult: ReadonlyArray<AdminDomain>) =>
        [...prevResult, data],
      ),
  });

  const {
    mutate: updateDomain,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: ({ id, ...params }: UpdateDomainParams) => client.admin.domains.updateDomain(id, params.public),
    retry: false,
    onSuccess: (data) =>
      queryClient.setQueryData(['admin', 'domains'], (prevResult: ReadonlyArray<AdminDomain>) =>
        prevResult.map((domain) => domain.id === data.id ? data : domain),
      ),
  });

  const {
    mutate: deleteDomain,
    isPending: isDeleting,
  } = useMutation({
    mutationFn: (id: string) => client.admin.domains.deleteDomain(id),
    retry: false,
    onSuccess: (_, id) =>
      queryClient.setQueryData(['admin', 'domains'], (prevResult: ReadonlyArray<AdminDomain>) =>
        prevResult.filter(({ id: domainId }) => domainId !== id),
      ),
  });

  return {
    ...result,
    createDomain,
    isCreating,
    updateDomain,
    isUpdating,
    deleteDomain,
    isDeleting,
  };
};

export { useDomains };
