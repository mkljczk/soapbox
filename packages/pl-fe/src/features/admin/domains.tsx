import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { dateFormatOptions } from 'pl-fe/components/relative-timestamp';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Button from 'pl-fe/components/ui/button';
import Column from 'pl-fe/components/ui/column';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { domainsQueryOptions, deleteDomainMutationOptions } from 'pl-fe/queries/admin/domains';
import { useModalsStore } from 'pl-fe/stores/modals';
import toast from 'pl-fe/toast';

import Indicator from '../developers/components/indicator';

import type { AdminDomain as DomainEntity } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.admin.domains', defaultMessage: 'Domains' },
  deleteConfirm: { id: 'confirmations.admin.delete_domain.confirm', defaultMessage: 'Delete' },
  deleteHeading: { id: 'confirmations.admin.delete_domain.heading', defaultMessage: 'Delete domain' },
  deleteMessage: { id: 'confirmations.admin.delete_domain.message', defaultMessage: 'Are you sure you want to delete the domain?' },
  domainDeleteSuccess: { id: 'admin.edit_domain.deleted', defaultMessage: 'Domain deleted' },
  domainLastChecked: { id: 'admin.domains.resolve.last_checked', defaultMessage: 'Last checked: {date}' },
});

interface IDomain {
  domain: DomainEntity;
}

const Domain: React.FC<IDomain> = ({ domain }) => {
  const intl = useIntl();

  const { openModal } = useModalsStore();
  const { deleteDomain } = useMutation(deleteDomainMutationOptions);

  const handleEditDomain = (domain: DomainEntity) => () => {
    openModal('EDIT_DOMAIN', { domainId: domain.id });
  };

  const handleDeleteDomain = () => () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => {
        deleteDomain(domain.id, {
          onSuccess: () => {
            toast.success(messages.domainDeleteSuccess);
          },
        });
      },
    });
  };

  const domainState = domain.last_checked_at ? (domain.resolves ? 'active' : 'error') : 'pending';
  const domainStateLabel = {
    active: <FormattedMessage id='admin.domains.resolve.success_label' defaultMessage='Resolves correctly' />,
    error: <FormattedMessage id='admin.domains.resolve.fail_label' defaultMessage='Not resolving' />,
    pending: <FormattedMessage id='admin.domains.resolve.pending_label' defaultMessage='Pending resolve check' />,
  }[domainState];
  const domainStateTitle = domain.last_checked_at ? intl.formatMessage(messages.domainLastChecked, {
    date: intl.formatDate(domain.last_checked_at, dateFormatOptions),
  }) : undefined;

  return (
    <div key={domain.id} className='rounded-lg bg-gray-100 p-4 dark:bg-primary-800'>
      <Stack space={2}>
        <HStack alignItems='center' space={4} wrap>
          <Text size='sm'>
            <Text tag='span' size='sm' weight='medium'>
              <FormattedMessage id='admin.domains.name' defaultMessage='Domain:' />
            </Text>
            {' '}
            {domain.domain}
          </Text>
          <Text tag='span' size='sm' weight='medium'>
            {domain.public ? (
              <FormattedMessage id='admin.domains.public' defaultMessage='Public' />
            ) : (
              <FormattedMessage id='admin.domains.private' defaultMessage='Private' />
            )}
          </Text>
          <HStack alignItems='center' space={2} title={domainStateTitle}>
            <Indicator state={domainState} />
            <Text tag='span' size='sm' weight='medium'>
              {domainStateLabel}
            </Text>
          </HStack>
        </HStack>
        <HStack justifyContent='end' space={2}>
          <Button theme='primary' onClick={handleEditDomain(domain)}>
            <FormattedMessage id='admin.domains.edit' defaultMessage='Edit' />
          </Button>
          <Button theme='primary' onClick={handleDeleteDomain()}>
            <FormattedMessage id='admin.domains.delete' defaultMessage='Delete' />
          </Button>
        </HStack>
      </Stack>
    </div>
  );
};

const Domains: React.FC = () => {
  const intl = useIntl();

  const { openModal } = useModalsStore();
  const { data: domains, isFetching, refetch } = useQuery(domainsQueryOptions);

  const handleCreateDomain = () => {
    openModal('EDIT_DOMAIN');
  };

  useEffect(() => {
    if (!isFetching) refetch();
  }, []);

  const emptyMessage = <FormattedMessage id='empty_column.admin.domains' defaultMessage='There are no domains yet.' />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack className='gap-4'>
        <Button
          className='sm:w-fit sm:self-end'
          icon={require('@tabler/icons/outline/plus.svg')}
          onClick={handleCreateDomain}
          theme='secondary'
          block
        >
          <FormattedMessage id='admin.domains.action' defaultMessage='Create domain' />
        </Button>
        {domains && (
          <ScrollableList
            emptyMessage={emptyMessage}
            itemClassName='py-3 first:pt-0 last:pb-0'
            isLoading={isFetching}
            showLoading={isFetching && !domains?.length}
          >
            {domains.map((domain) => (
              <Domain key={domain.id} domain={domain} />
            ))}
          </ScrollableList>
        )}
      </Stack>
    </Column>
  );
};

export { Domains as default };
