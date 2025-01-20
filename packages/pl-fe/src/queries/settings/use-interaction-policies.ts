import { useMutation, useQuery } from '@tanstack/react-query';
import { type InteractionPolicies, interactionPoliciesSchema } from 'pl-api';
import * as v from 'valibot';

import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';
import { queryClient } from 'pl-fe/queries/client';

const emptySchema = v.parse(interactionPoliciesSchema, {});

const useInteractionPolicies = () => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();
  const features = useFeatures();

  const { data, ...result } = useQuery({
    queryKey: ['interactionPolicies'],
    queryFn: client.settings.getInteractionPolicies,
    placeholderData: emptySchema,
    enabled: isLoggedIn && features.interactionRequests,
  });

  const {
    mutate: updateInteractionPolicies,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: (policy: InteractionPolicies) =>
      client.settings.updateInteractionPolicies(policy),
    retry: false,
    onSuccess: (policy) => {
      queryClient.setQueryData(['interactionPolicies'], policy);
    },
  });

  return {
    interactionPolicies: data || emptySchema,
    updateInteractionPolicies,
    isUpdating,
    ...result,
  };
};

export { useInteractionPolicies };
