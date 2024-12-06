import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { joinEvent } from 'pl-fe/actions/events';
import FormGroup from 'pl-fe/components/ui/form-group';
import Modal from 'pl-fe/components/ui/modal';
import Textarea from 'pl-fe/components/ui/textarea';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';

import { BaseModalProps } from '../modal-root';

const messages = defineMessages({
  hint: { id: 'join_event.hint', defaultMessage: 'You can tell the organizer why do you want to participate in this event:' },
  placeholder: { id: 'join_event.placeholder', defaultMessage: 'Message to organizer' },
  join: { id: 'join_event.join', defaultMessage: 'Request join' },
});

interface JoinEventModalProps {
  statusId: string;
}

const JoinEventModal: React.FC<BaseModalProps & JoinEventModalProps> = ({ onClose, statusId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [participationMessage, setParticipationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    onClose('JOIN_EVENT');
  };

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = e => {
    setParticipationMessage(e.target.value);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    dispatch(joinEvent(statusId, participationMessage)).then(() => {
      handleClose();
    }).catch(() => {});
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <Modal
      title={<FormattedMessage id='join_event.title' defaultMessage='Join event' />}
      onClose={handleClose}
      confirmationAction={handleSubmit}
      confirmationText={intl.formatMessage(messages.join)}
      confirmationDisabled={isSubmitting}
    >
      <FormGroup labelText={intl.formatMessage(messages.hint)}>
        <Textarea
          placeholder={intl.formatMessage(messages.placeholder)}
          value={participationMessage}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          autoFocus
        />
      </FormGroup>
    </Modal>
  );
};

export { JoinEventModal as default, type JoinEventModalProps };
