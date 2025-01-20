import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Form from 'pl-fe/components/ui/form';
import FormGroup from 'pl-fe/components/ui/form-group';
import HStack from 'pl-fe/components/ui/hstack';
import Input from 'pl-fe/components/ui/input';
import Modal from 'pl-fe/components/ui/modal';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Toggle from 'pl-fe/components/ui/toggle';
import { createDomainMutationOptions, domainsQueryOptions, updateDomainMutationOptions } from 'pl-fe/queries/admin/domains';
import toast from 'pl-fe/toast';

import type { BaseModalProps } from '../modal-root';

const messages = defineMessages({
  save: { id: 'admin.edit_domain.save', defaultMessage: 'Save' },
  domainPlaceholder: { id: 'admin.edit_domain.fields.domain_placeholder', defaultMessage: 'Domain name' },
  domainCreateSuccess: { id: 'admin.edit_domain.created', defaultMessage: 'Domain created' },
  domainUpdateSuccess: { id: 'admin.edit_domain.updated', defaultMessage: 'Domain edited' },
});

interface EditDomainModalProps {
  domainId?: string;
}

const EditDomainModal: React.FC<BaseModalProps & EditDomainModalProps> = ({ onClose, domainId }) => {
  const intl = useIntl();

  const { data: domain } = useQuery({
    ...domainsQueryOptions,
    select: (domains) => domains.find(({ id }) => domainId === id),
  });
  const { mutate: createDomain, isPending: isCreating } = useMutation(createDomainMutationOptions);
  const { mutate: updateDomain, isPending: isUpdating } = useMutation(updateDomainMutationOptions);

  const [domainName, setDomainName] = useState(domain?.domain || '');
  const [isPublic, setPublic] = useState(domain?.public || false);

  const onClickClose = () => {
    onClose('EDIT_DOMAIN');
  };

  const handleSubmit = () => {
    if (domainId) {
      updateDomain({
        id: domainId,
        public: isPublic,
      }, {
        onSuccess: () => {
          toast.success(messages.domainUpdateSuccess);
          onClose('EDIT_DOMAIN');
        },
      });
    } else {
      createDomain({
        domain: domainName,
        public: isPublic,
      }, {
        onSuccess: () => {
          toast.success(messages.domainCreateSuccess);
          onClose('EDIT_DOMAIN');
        },
      });
    }
  };

  return (
    <Modal
      onClose={onClickClose}
      title={domainId
        ? <FormattedMessage id='column.admin.edit_domain' defaultMessage='Edit domain' />
        : <FormattedMessage id='column.admin.create_domain' defaultMessage='Create domain' />}
      confirmationAction={handleSubmit}
      confirmationText={intl.formatMessage(messages.save)}
      confirmationDisabled={isCreating || isUpdating}
    >
      <Form>
        <FormGroup
          labelText={<FormattedMessage id='admin.edit_domain.fields.domain_label' defaultMessage='Domain' />}
        >
          <Input
            autoComplete='off'
            placeholder={intl.formatMessage(messages.domainPlaceholder)}
            value={domainName}
            onChange={({ target }) => setDomainName(target.value)}
            disabled={!!domainId}
          />
        </FormGroup>
        <HStack alignItems='center' space={2}>
          <Toggle
            checked={isPublic}
            onChange={({ target }) => setPublic(target.checked)}
          />
          <Stack>
            <Text tag='span' theme='muted'>
              <FormattedMessage id='admin.edit_domain.fields.public_label' defaultMessage='Public' />
            </Text>
            <Text size='xs' tag='span' theme='muted'>
              <FormattedMessage id='admin.edit_domain.fields.public_hint' defaultMessage='When checked, everyone can sign up for an username with this domain' />
            </Text>
          </Stack>
        </HStack>
      </Form>
    </Modal>
  );
};

export { EditDomainModal as default, type EditDomainModalProps };
