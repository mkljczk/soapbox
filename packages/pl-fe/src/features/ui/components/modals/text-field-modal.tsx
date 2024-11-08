import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Modal from 'pl-fe/components/ui/modal';
import Stack from 'pl-fe/components/ui/stack';
import Textarea from 'pl-fe/components/ui/textarea';

import type { BaseModalProps } from '../modal-root';
import type { ButtonThemes } from 'pl-fe/components/ui/button/useButtonStyles';

interface TextFieldModalProps {
  heading: React.ReactNode;
  placeholder?: string;
  confirm: React.ReactNode;
  onConfirm: (value?: string) => void;
  onCancel?: () => void;
  confirmationTheme?: ButtonThemes;
  text?: string;
}

const TextFieldModal: React.FC<TextFieldModalProps & BaseModalProps> = ({
  heading,
  placeholder,
  confirm,
  onClose,
  onConfirm,
  onCancel,
  confirmationTheme,
  text,
}) => {
  const [value, setValue] = useState(text);

  const handleClick = () => {
    onClose('TEXT_FIELD');
    onConfirm(value);
  };

  const handleCancel = () => {
    onClose('TEXT_FIELD');
    if (onCancel) onCancel();
  };

  return (
    <Modal
      title={heading}
      confirmationAction={handleClick}
      confirmationText={confirm}
      confirmationTheme={confirmationTheme}
      cancelText={<FormattedMessage id='confirmation_modal.cancel' defaultMessage='Cancel' />}
      cancelAction={handleCancel}
    >
      <Stack space={4}>
        <Textarea
          value={value}
          onChange={({ target }) => setValue(target.value)}
          autoComplete='off'
          placeholder={placeholder}
        />
      </Stack>
    </Modal>
  );
};

export { type TextFieldModalProps, TextFieldModal as default };
