
import { useQuery } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';

const useBirthdayReminders = (month: number, day: number) => {
  const client = useClient();
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ['accountsLists', 'birthdayReminders', month, day],
    queryFn: () => client.accounts.getBirthdays(day, month).then((accounts) => {
      dispatch(importEntities({ accounts }));

      return accounts.map(({ id }) => id);
    }),
  });
};

export { useBirthdayReminders };
