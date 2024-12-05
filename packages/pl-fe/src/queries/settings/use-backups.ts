import { useMutation, useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';

import { queryClient } from '../client';

const useBackupsQuery = () => {
  const client = useClient();

  return useQuery({
    queryKey: ['settings', 'backups'],
    queryFn: () => client.settings.getBackups(),
    select: (backups) => backups.toSorted((a, b) => a.inserted_at.localeCompare(b.inserted_at)),
  });
};

const useCreateBackupMutation = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['settings', 'backups'],
    mutationFn: () => client.settings.createBackup(),
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: ['settings', 'backups'],
    }),
  });
};

export { useBackupsQuery, useCreateBackupMutation };
