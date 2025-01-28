import { queryOptions } from '@tanstack/react-query';

import { getClient } from 'pl-fe/api';
import { queryClient } from 'pl-fe/queries/client';

import { mutationOptions } from '../utils/mutation-options';

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
  onSuccess: (data) => {
    queryClient.setQueryData(domainsQueryOptions.queryKey, (prevResult = []) =>
      [...prevResult, data],
    );
  },
});

const updateDomainMutationOptions = mutationOptions({
  mutationFn: ({ id, ...params }: UpdateDomainParams) => getClient().admin.domains.updateDomain(id, params.public),
  retry: false,
  onSuccess: (data) => {
    queryClient.setQueryData(domainsQueryOptions.queryKey, (prevResult = []) =>
      prevResult.map((domain) => domain.id === data.id ? data : domain),
    );
  },
});

const deleteDomainMutationOptions = mutationOptions({
  mutationFn: (id: string) => getClient().admin.domains.deleteDomain(id),
  retry: false,
  onSuccess: (_, id) => {
    queryClient.setQueryData(domainsQueryOptions.queryKey, (prevResult = []) =>
      prevResult.filter(({ id: domainId }) => domainId !== id),
    );
  },
});

export { domainsQueryOptions, createDomainMutationOptions, updateDomainMutationOptions, deleteDomainMutationOptions };
