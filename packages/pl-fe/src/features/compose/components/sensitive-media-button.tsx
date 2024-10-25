import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeComposeSpoilerness } from 'pl-fe/actions/compose';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';

import ComposeFormButton from './compose-form-button';

const messages = defineMessages({
  marked: { id: 'compose_form.sensitive.marked', defaultMessage: 'Media is marked as sensitive' },
  unmarked: { id: 'compose_form.sensitive.unmarked', defaultMessage: 'Media is not marked as sensitive' },
});

interface ISensitiveMediaButton {
  composeId: string;
}

const SensitiveMediaButton: React.FC<ISensitiveMediaButton> = ({ composeId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const active = useCompose(composeId).sensitive;

  const onClick = () =>
    dispatch(changeComposeSpoilerness(composeId));

  return (
    <ComposeFormButton
      icon={require('@tabler/icons/outline/alert-triangle.svg')}
      title={intl.formatMessage(active ? messages.marked : messages.unmarked)}
      active={active}
      onClick={onClick}
    />
  );
};

export { SensitiveMediaButton as default };
