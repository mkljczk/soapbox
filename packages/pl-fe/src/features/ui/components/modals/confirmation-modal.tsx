import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import List, { ListItem } from 'pl-fe/components/list';
import Modal from 'pl-fe/components/ui/modal';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Toggle from 'pl-fe/components/ui/toggle';

import type { BaseModalProps } from '../modal-root';
import type { ButtonThemes } from 'pl-fe/components/ui/button/useButtonStyles';

interface ConfirmationModalProps {
  heading?: React.ReactNode;
  message: React.ReactNode;
  confirm: React.ReactNode;
  onConfirm: () => void;
  secondary?: React.ReactNode;
  onSecondary?: () => void;
  onCancel?: () => void;
  checkbox?: string | false;
  confirmationTheme?: ButtonThemes;
}

const ConfirmationModal: React.FC<BaseModalProps & ConfirmationModalProps> = ({
  heading,
  message,
  confirm,
  onClose,
  onConfirm,
  secondary,
  onSecondary,
  onCancel,
  checkbox,
  confirmationTheme = 'danger',
}) => {
  const [checked, setChecked] = useState(false);

  const handleClick = () => {
    onClose('CONFIRM');
    onConfirm();
  };

  const handleSecondary = () => {
    onClose('CONFIRM');
    onSecondary!();
  };

  const handleCancel = () => {
    onClose('CONFIRM');
    if (onCancel) onCancel();
  };

  const handleCheckboxChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setChecked(e.target.checked);
  };

  return (
    <Modal
      title={heading}
      confirmationAction={handleClick}
      confirmationText={confirm}
      confirmationDisabled={!!checkbox && !checked}
      confirmationTheme={confirmationTheme}
      cancelText={<FormattedMessage id='confirmation_modal.cancel' defaultMessage='Cancel' />}
      cancelAction={handleCancel}
      secondaryText={secondary}
      secondaryAction={onSecondary && handleSecondary}
    >
      <Stack space={4}>
        <Text>
          {message}
        </Text>

        {checkbox && (
          <List>
            <ListItem label={checkbox}>
              <Toggle
                checked={checked}
                onChange={handleCheckboxChange}
                required
              />
            </ListItem>
          </List>
        )}
      </Stack>
    </Modal>
  );
};

export { ConfirmationModal as default, type ConfirmationModalProps };
