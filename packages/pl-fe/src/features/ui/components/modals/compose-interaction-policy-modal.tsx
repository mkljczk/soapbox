import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { changeComposeInteractionPolicyOption } from 'pl-fe/actions/compose';
import Modal from 'pl-fe/components/ui/modal';
import Stack from 'pl-fe/components/ui/stack';
import { InteractionPolicyConfig, type Policy, type Rule, type Scope } from 'pl-fe/features/interaction-policies';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';
import { useInteractionPolicies } from 'pl-fe/queries/settings/use-interaction-policies';

import type { BaseModalProps } from '../modal-root';

interface ComposeInteractionPolicyModalProps {
  composeId: string;
}

const ComposeInteractionPolicyModal: React.FC<BaseModalProps & ComposeInteractionPolicyModalProps> = ({ composeId, onClose }) => {
  const dispatch = useAppDispatch();
  const { interactionPolicies: initial } = useInteractionPolicies();
  const compose = useCompose(composeId);

  const canManageInteractionPolicies = compose.privacy === 'public' || compose.privacy === 'unlisted' || compose.privacy === 'private';

  useEffect(() => {
    if (!canManageInteractionPolicies) {
      onClose('COMPOSE_INTERACTION_POLICY');
    }
  }, []);

  if (!canManageInteractionPolicies) {

    return null;
  }

  const interactionPolicy = (compose.interactionPolicy || initial[compose.privacy as 'public']);

  const onClickClose = () => {
    onClose('COMPOSE_INTERACTION_POLICY');
  };

  const onChange = (policy: Policy, rule: Rule, value: Scope[]) => {
    dispatch(changeComposeInteractionPolicyOption(composeId, policy, rule, value, interactionPolicy));
  };

  return (
    <Modal
      title={<FormattedMessage id='navigation_bar.interaction_policy' defaultMessage='Status interaction policy' />}
      onClose={onClickClose}
      closeIcon={composeId === 'compose-modal' ? require('@tabler/icons/outline/arrow-left.svg') : undefined}
      closePosition={composeId === 'compose-modal' ? 'left' : undefined}
    >
      <Stack space={4}>
        <InteractionPolicyConfig
          interactionPolicy={interactionPolicy}
          visibility={compose.privacy as 'public'}
          onChange={onChange}
          singlePost
        />
      </Stack>
    </Modal>
  );
};

export { ComposeInteractionPolicyModal as default, type ComposeInteractionPolicyModalProps };
