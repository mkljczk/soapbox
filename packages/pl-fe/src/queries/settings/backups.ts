import { queryOptions } from '@tanstack/react-query';

import { getClient } from 'pl-fe/api';

import { queryClient } from '../client';
import { mutationOptions } from '../utils/mutation-options';

const backupsQueryOptions = queryOptions({
  queryKey: ['settings', 'backups'],
  queryFn: () => getClient().settings.getBackups(),
  select: (backups) => backups.toSorted((a, b) => b.inserted_at.localeCompare(a.inserted_at)),
});

const createBackupMutationOptions = mutationOptions({
  mutationKey: ['settings', 'backups'],
  mutationFn: () => getClient().settings.createBackup(),
  onSuccess: () => queryClient.invalidateQueries({
    queryKey: ['settings', 'backups'],
  }),
});

export {
  backupsQueryOptions,
  createBackupMutationOptions,
};
