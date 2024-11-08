import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { joinEvent, leaveEvent } from 'pl-fe/actions/events';
import Button from 'pl-fe/components/ui/button';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useModalsStore } from 'pl-fe/stores/modals';

import type { ButtonThemes } from 'pl-fe/components/ui/button/useButtonStyles';
import type { Status as StatusEntity } from 'pl-fe/normalizers/status';

const messages = defineMessages({
  leaveHeading: { id: 'confirmations.leave_event.heading', defaultMessage: 'Leave event' },
  leaveMessage: { id: 'confirmations.leave_event.message', defaultMessage: 'If you want to rejoin the event, the request will be manually reviewed again. Are you sure you want to proceed?' },
  leaveConfirm: { id: 'confirmations.leave_event.confirm', defaultMessage: 'Leave event' },
});

interface IEventAction {
  status: Pick<StatusEntity, 'id' | 'event' | 'url'>;
  theme?: ButtonThemes;
}

const EventActionButton: React.FC<IEventAction> = ({ status, theme = 'secondary' }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { openModal } = useModalsStore();
  const me = useAppSelector((state) => state.me);

  const event = status.event!;

  if (event.join_mode === 'external') {
    return (
      <Button
        className='min-w-max'
        size='sm'
        theme={theme}
        icon={require('@fluentui/open_24_regular.svg')}
        href={status.url}
      >
        <FormattedMessage id='event.join_state.empty' defaultMessage='Participate' />
      </Button>
    );
  }

  const handleJoin: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault();

    if (event.join_mode === 'free') {
      dispatch(joinEvent(status.id));
    } else {
      openModal('JOIN_EVENT', {
        statusId: status.id,
      });
    }
  };

  const handleLeave: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault();

    if (event.join_mode === 'restricted') {
      openModal('CONFIRM', {
        heading: intl.formatMessage(messages.leaveHeading),
        message: intl.formatMessage(messages.leaveMessage),
        confirm: intl.formatMessage(messages.leaveConfirm),
        onConfirm: () => dispatch(leaveEvent(status.id)),
      });
    } else {
      dispatch(leaveEvent(status.id));
    }
  };

  const handleOpenUnauthorizedModal: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault();

    openModal('UNAUTHORIZED', {
      action: 'JOIN',
      ap_id: status.url,
    });
  };

  let buttonLabel;
  let buttonIcon;
  let buttonDisabled = false;
  let buttonAction = handleLeave;

  switch (event.join_state) {
    case 'accept':
      buttonLabel = <FormattedMessage id='event.join_state.accept' defaultMessage='Going' />;
      buttonIcon = require('@tabler/icons/outline/check.svg');
      break;
    case 'pending':
      buttonLabel = <FormattedMessage id='event.join_state.pending' defaultMessage='Pending' />;
      break;
    case 'reject':
      buttonLabel = <FormattedMessage id='event.join_state.rejected' defaultMessage='Going' />;
      buttonIcon = require('@fluentui/presence_blocked_24_regular.svg');
      buttonDisabled = true;
      break;
    default:
      buttonLabel = <FormattedMessage id='event.join_state.empty' defaultMessage='Participate' />;
      buttonAction = me ? handleJoin : handleOpenUnauthorizedModal;
  }

  return (
    <Button
      className='min-w-max'
      size='sm'
      theme={theme}
      icon={buttonIcon}
      onClick={buttonAction}
      disabled={buttonDisabled}
    >
      {buttonLabel}
    </Button>
  );
};

export { EventActionButton as default };
