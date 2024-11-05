import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type InteractionPolicies, interactionPoliciesSchema } from 'pl-api';
import * as v from 'valibot';

import { usePlHooksApiClient } from 'pl-hooks/main';

const emptySchema = v.parse(interactionPoliciesSchema, {});

const useInteractionPolicies = () => {
  const { client, me } = usePlHooksApiClient();
  const queryClient = useQueryClient();

  const features = client.features;

  const { data, ...result } = useQuery({
    queryKey: ['settings', 'interactionPolicies'],
    queryFn: client.settings.getInteractionPolicies,
    enabled: !!me && features.interactionRequests,
  }, queryClient);

  const {
    mutate: updateInteractionPolicies,
    isPending: isUpdating,
  } = useMutation({
    mutationKey: ['settings', 'interactionPolicies'],
    mutationFn: (policy: InteractionPolicies) =>
      client.settings.updateInteractionPolicies(policy),
    retry: false,
    onSuccess: (policy) => {
      queryClient.setQueryData(['interactionPolicies'], policy);
    },
  }, queryClient);

  return {
    interactionPolicies: data || emptySchema,
    updateInteractionPolicies,
    isUpdating,
    ...result,
  };
};

export { useInteractionPolicies };
