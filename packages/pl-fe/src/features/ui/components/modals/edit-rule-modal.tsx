import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Form from 'pl-fe/components/ui/form';
import FormGroup from 'pl-fe/components/ui/form-group';
import Input from 'pl-fe/components/ui/input';
import Modal from 'pl-fe/components/ui/modal';
import { useTextField } from 'pl-fe/hooks/forms/use-text-field';
import { createRuleMutationOptions, updateRuleMutationOptions } from 'pl-fe/queries/admin/rules';
import toast from 'pl-fe/toast';

import type { BaseModalProps } from '../modal-root';
import type { AdminRule } from 'pl-api';

const messages = defineMessages({
  save: { id: 'admin.edit_rule.save', defaultMessage: 'Save' },
  ruleTextPlaceholder: { id: 'admin.edit_rule.fields.text_placeholder', defaultMessage: 'Instance rule text' },
  rulePriorityPlaceholder: { id: 'admin.edit_rule.fields.priority_placeholder', defaultMessage: 'Instance rule display priority' },
  ruleCreateSuccess: { id: 'admin.edit_rule.created', defaultMessage: 'Rule created' },
  ruleUpdateSuccess: { id: 'admin.edit_rule.updated', defaultMessage: 'Rule edited' },
});

interface EditRuleModalProps {
  rule?: AdminRule;
}

const EditRuleModal: React.FC<BaseModalProps & EditRuleModalProps> = ({ onClose, rule }) => {
  const intl = useIntl();

  const { mutate: createRule } = useMutation(createRuleMutationOptions);
  const { mutate: updateRule } = useMutation(updateRuleMutationOptions);

  const text = useTextField(rule?.text);
  const priority = useTextField(rule?.priority?.toString());

  const onClickClose = () => {
    onClose('EDIT_RULE');
  };

  const handleSubmit = () => {
    if (rule) {
      updateRule({
        id: rule.id,
        text: text.value,
        priority: isNaN(Number(priority.value)) ? undefined : Number(priority.value),
      }, {
        onSuccess: () => {
          toast.success(messages.ruleUpdateSuccess);
          onClickClose();
        },
      });
    } else {
      createRule({
        text: text.value,
        priority: isNaN(Number(priority.value)) ? undefined : Number(priority.value),
      }, {
        onSuccess: () => {
          toast.success(messages.ruleUpdateSuccess);
          onClickClose();
        },
      });
    }
  };

  return (
    <Modal
      onClose={onClickClose}
      title={rule
        ? <FormattedMessage id='column.admin.edit_rule' defaultMessage='Edit rule' />
        : <FormattedMessage id='column.admin.create_rule' defaultMessage='Create rule' />}
      confirmationAction={handleSubmit}
      confirmationText={intl.formatMessage(messages.save)}
    >
      <Form>
        <FormGroup
          labelText={<FormattedMessage id='admin.edit_rule.fields.text_label' defaultMessage='Rule text' />}
        >
          <Input
            placeholder={intl.formatMessage(messages.ruleTextPlaceholder)}
            {...text}
          />
        </FormGroup>
        <FormGroup
          labelText={<FormattedMessage id='admin.edit_rule.fields.priority_label' defaultMessage='Rule priority' />}
        >
          <Input
            placeholder={intl.formatMessage(messages.rulePriorityPlaceholder)}
            type='number'
            {...priority}
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export { EditRuleModal as default, type EditRuleModalProps };
