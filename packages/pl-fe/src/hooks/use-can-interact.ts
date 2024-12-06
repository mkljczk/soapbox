import { useAppSelector } from './use-app-selector';

import type { InteractionPolicy, InteractionPolicyEntry } from 'pl-api';
import type { MinifiedStatus } from 'pl-fe/reducers/statuses';

const useCanInteract = (status: Pick<MinifiedStatus, 'account_id' | 'mentions' | 'interaction_policy'>, type: keyof InteractionPolicy): {
  canInteract: boolean;
  approvalRequired: boolean | null;
  allowed?: Array<InteractionPolicyEntry>;
} => {
  const interactionPolicy = status.interaction_policy;

  const me = useAppSelector(state => state.me);

  if (me === status.account_id || interactionPolicy[type].always.includes('me')) return {
    canInteract: true,
    approvalRequired: false,
  };

  if (interactionPolicy[type].with_approval.includes('me')) return {
    canInteract: true,
    approvalRequired: true,
  };

  return {
    canInteract: false,
    approvalRequired: null,
    allowed: [...interactionPolicy[type].always, ...interactionPolicy[type].with_approval],
  };
};

export { useCanInteract };
