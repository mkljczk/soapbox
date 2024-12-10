import { queryOptions } from '@tanstack/react-query';

import { getClient } from 'pl-fe/api';
import { queryClient } from 'pl-fe/queries/client';

import { mutationOptions } from '../utils/mutation-options';

import type { AdminDomain } from 'pl-api';

interface CreateDomainParams {
  domain: string;
  public: boolean;
}

interface UpdateDomainParams {
  id: string;
  public: boolean;
}

const domainsQueryOptions = queryOptions({
  queryKey: ['admin', 'domains'],
  queryFn: () => getClient().admin.domains.getDomains(),
});

const createDomainMutationOptions = mutationOptions({
  mutationFn: (params: CreateDomainParams) => getClient().admin.domains.createDomain(params),
  retry: false,
  onSuccess: (data) =>
    queryClient.setQueryData(domainsQueryOptions.queryKey, (prevResult: ReadonlyArray<AdminDomain>) =>
      [...prevResult, data],
    ),
});

const updateDomainMutationOptions = mutationOptions({
  mutationFn: ({ id, ...params }: UpdateDomainParams) => getClient().admin.domains.updateDomain(id, params.public),
  retry: false,
  onSuccess: (data) =>
    queryClient.setQueryData(domainsQueryOptions.queryKey, (prevResult: ReadonlyArray<AdminDomain>) =>
      prevResult.map((domain) => domain.id === data.id ? data : domain),
    ),
});

const deleteDomainMutationOptions = mutationOptions({
  mutationFn: (id: string) => getClient().admin.domains.deleteDomain(id),
  retry: false,
  onSuccess: (_, id) =>
    queryClient.setQueryData(domainsQueryOptions.queryKey, (prevResult: ReadonlyArray<AdminDomain>) =>
      prevResult.filter(({ id: domainId }) => domainId !== id),
    ),
});

export { domainsQueryOptions, createDomainMutationOptions, updateDomainMutationOptions, deleteDomainMutationOptions };
