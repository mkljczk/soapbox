import React, { useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import * as v from 'valibot';

import { useCreateGroup } from 'pl-fe/api/hooks/groups/use-create-group';
import Modal from 'pl-fe/components/ui/modal';
import Stack from 'pl-fe/components/ui/stack';
import toast from 'pl-fe/toast';

import ConfirmationStep from './steps/confirmation-step';
import DetailsStep from './steps/details-step';

import type { BaseModalProps } from '../../modal-root';
import type { CreateGroupParams } from 'pl-api';
import type { PlfeResponse } from 'pl-fe/api';
import type { Group } from 'pl-fe/normalizers/group';

const messages = defineMessages({
  create: { id: 'manage_group.create', defaultMessage: 'Create Group' },
  done: { id: 'manage_group.done', defaultMessage: 'Done' },
});

enum Steps {
  ONE = 'ONE',
  TWO = 'TWO',
}
const CreateGroupModal: React.FC<BaseModalProps> = ({ onClose }) => {
  const intl = useIntl();

  const [group, setGroup] = useState<Group | null>(null);
  const [params, setParams] = useState<CreateGroupParams>({
    display_name: '',
  });
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.ONE);

  const { createGroup, isSubmitting } = useCreateGroup();

  const handleClose = () => {
    onClose('CREATE_GROUP');
  };

  const confirmationText = useMemo(() => {
    switch (currentStep) {
      case Steps.TWO:
        return intl.formatMessage(messages.done);
      default:
        return intl.formatMessage(messages.create);
    }
  }, [currentStep]);

  const handleNextStep = () => {
    switch (currentStep) {
      case Steps.ONE:
        createGroup(params, {
          onSuccess(group) {
            setCurrentStep(Steps.TWO);
            setGroup(group);
          },
          onError(error: { response?: PlfeResponse }) {
            const msg = v.safeParse(v.object({ error: v.string() }), error?.response?.json);
            if (msg.success) {
              toast.error(msg.output.error);
            }
          },
        });
        break;
      case Steps.TWO:
        handleClose();
        break;
      default:
        break;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case Steps.ONE:
        return <DetailsStep params={params} onChange={setParams} />;
      case Steps.TWO:
        return <ConfirmationStep group={group} />;
    }
  };

  const renderModalTitle = () => <FormattedMessage id='navigation_bar.create_group' defaultMessage='Create group' />;

  return (
    <Modal
      title={renderModalTitle()}
      confirmationAction={handleNextStep}
      confirmationText={confirmationText}
      confirmationDisabled={isSubmitting}
      confirmationFullWidth
      onClose={handleClose}
    >
      <Stack space={2}>
        {renderStep()}
      </Stack>
    </Modal>
  );
};

export { CreateGroupModal as default };
