import React from 'react';
import { FormattedDate, defineMessages, useIntl } from 'react-intl';

import Button from 'pl-fe/components/ui/button';
import Card from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import FormActions from 'pl-fe/components/ui/form-actions';
import HStack from 'pl-fe/components/ui/hstack';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useBackups, useCreateBackupMutation } from 'pl-fe/queries/settings/use-backups';

import type { Backup as BackupEntity } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.backups', defaultMessage: 'Backups' },
  create: { id: 'backups.actions.create', defaultMessage: 'Create backup' },
  emptyMessage: { id: 'backups.empty_message', defaultMessage: 'No backups found. {action}' },
  emptyMessageAction: { id: 'backups.empty_message.action', defaultMessage: 'Create one now?' },
  download: { id: 'backups.download', defaultMessage: 'Download' },
  pending: { id: 'backups.pending', defaultMessage: 'Pending' },
});

interface IBackup {
  backup: BackupEntity;
}

const Backup: React.FC<IBackup> = ({ backup }) => {
  const intl = useIntl();

  const button = (
    <Button theme='primary' disabled={!backup.processed}>
      {intl.formatMessage(backup.processed ? messages.download : messages.pending)}
    </Button>
  );

  return (
    <div key={backup.id} className='dark:bg-primary-800 rounded-lg bg-gray-100 p-4'>
      <Stack space={2}>
        <Stack>
          <Text size='md'>
            <FormattedDate
              value={backup.inserted_at}
              hour12
              year='numeric'
              month='short'
              day='2-digit'
              hour='numeric'
              minute='2-digit'
            />
          </Text>
        </Stack>
        <HStack justifyContent='end'>
          {backup.processed ? <a href={backup.url} target='_blank'>{button}</a> : button}
        </HStack>
      </Stack>
    </div>
  );
};

const Backups = () => {
  const intl = useIntl();

  const { data: backups = [], isLoading } = useBackups();
  const { mutate: createBackup } = useCreateBackupMutation();

  const handleCreateBackup: React.MouseEventHandler = e => {
    createBackup();
    e.preventDefault();
  };

  const showLoading = isLoading && backups.length === 0;

  const emptyMessage = (
    <Card variant='rounded' size='lg'>
      {intl.formatMessage(messages.emptyMessage, {
        action: (
          <a href='#' onClick={handleCreateBackup}>
            <Text tag='span' theme='primary' size='sm' className='hover:underline'>
              {intl.formatMessage(messages.emptyMessageAction)}
            </Text>
          </a>
        ),
      })}
    </Card>
  );

  const body = showLoading ? <Spinner /> : backups.length ? (
    <div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
      {backups.map((backup) => <Backup key={backup.id} backup={backup} />)}
    </div>
  ) : emptyMessage;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      {body}

      <FormActions>
        <Button theme='primary' disabled={isLoading} onClick={handleCreateBackup}>
          {intl.formatMessage(messages.create)}
        </Button>
      </FormActions>
    </Column>
  );
};

export { Backups as default };
