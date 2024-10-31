import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Modal from 'pl-fe/components/ui/modal';

import type { BaseModalProps } from '../modal-root';

const messages = defineMessages({
  modalTitle: { id: 'missing_description_modal.text', defaultMessage: 'You have not entered a description for all attachments. Continue anyway?' },
  post: { id: 'missing_description_modal.continue', defaultMessage: 'Post' },
  cancel: { id: 'missing_description_modal.cancel', defaultMessage: 'Cancel' },
});

interface MissingDescriptionModalProps {
  onContinue: () => void;
}

const MissingDescriptionModal: React.FC<BaseModalProps & MissingDescriptionModalProps> = ({ onClose, onContinue }) => {
  const intl = useIntl();

  return (
    <Modal
      title={intl.formatMessage(messages.modalTitle)}
      confirmationAction={onContinue}
      confirmationText={intl.formatMessage(messages.post)}
      confirmationTheme='danger'
      cancelText={intl.formatMessage(messages.cancel)}
      cancelAction={() => onClose('MISSING_DESCRIPTION')}
    >
      <p className='text-gray-600 dark:text-gray-300'>
        <FormattedMessage id='missing_description_modal.description' defaultMessage='Continue anyway?' />
      </p>
    </Modal>
  );
};

export { MissingDescriptionModal as default, type MissingDescriptionModalProps };
