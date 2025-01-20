import { queryOptions } from '@tanstack/react-query';
import { type InteractionPolicies, interactionPoliciesSchema } from 'pl-api';
import * as v from 'valibot';

import { getClient } from 'pl-fe/api';
import { queryClient } from 'pl-fe/queries/client';

import { mutationOptions } from '../utils/mutation-options';

const emptySchema = v.parse(interactionPoliciesSchema, {});

const interactionPoliciesQueryOptions = queryOptions({
  queryKey: ['interactionPolicies'],
  queryFn: getClient().settings.getInteractionPolicies,
  placeholderData: emptySchema,
  // enabled: isLoggedIn && features.interactionRequests,
});

const updateInteractionPoliciesMutationOptions = mutationOptions({
  mutationFn: (policy: InteractionPolicies) => getClient().settings.updateInteractionPolicies(policy),
  retry: false,
  onSuccess: (policy) => {
    queryClient.setQueryData(['interactionPolicies'], policy);
  },
});

export {
  interactionPoliciesQueryOptions,
  updateInteractionPoliciesMutationOptions,
};
