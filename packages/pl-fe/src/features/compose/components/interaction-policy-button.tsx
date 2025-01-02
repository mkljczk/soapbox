import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useCompose } from 'pl-fe/hooks/use-compose';
import { useModalsStore } from 'pl-fe/stores/modals';

import ComposeFormButton from './compose-form-button';

const messages = defineMessages({
  label: { id: 'compose_form.interaction_policy.label', defaultMessage: 'Manage interaction policy' },
});

interface IInteractionPolicyButton {
  composeId: string;
}

const InteractionPolicyButton: React.FC<IInteractionPolicyButton> = ({ composeId }) => {
  const intl = useIntl();

  const { openModal } = useModalsStore();

  const handleClick = () => {
    openModal('COMPOSE_INTERACTION_POLICY', {
      composeId,
    });
  };

  const { privacy, interactionPolicy } = useCompose(composeId);

  if (!['public', 'unlisted', 'private'].includes(privacy)) return null;

  return (
    <ComposeFormButton
      icon={require('@tabler/icons/outline/adjustments-star.svg')}
      title={intl.formatMessage(messages.label)}
      onClick={handleClick}
      active={!!interactionPolicy}
    />
  );
};

export { InteractionPolicyButton as default };
