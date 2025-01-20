
import { queryOptions } from '@tanstack/react-query';

import { importEntities } from 'pl-fe/actions/importer';
import { getClient } from 'pl-fe/api';
import { store } from 'pl-fe/store';

const birthdayRemindersQueryOptions = (month: number, day: number) => queryOptions({
  queryKey: ['accountsLists', 'birthdayReminders', month, day],
  queryFn: () => getClient().accounts.getBirthdays(day, month).then((accounts) => {
    store.dispatch(importEntities({ accounts }));

    return accounts.map(({ id }) => id);
  }),
});

export { birthdayRemindersQueryOptions };
