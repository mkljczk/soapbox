import { useMutation, useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';

import { queryClient } from '../client';

const useBackups = () => {
  const client = useClient();

  return useQuery({
    queryKey: ['settings', 'backups'],
    queryFn: () => client.settings.getBackups(),
    select: (backups) => backups.toSorted((a, b) => b.inserted_at.localeCompare(a.inserted_at)),
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

export { useBackups, useCreateBackupMutation };
