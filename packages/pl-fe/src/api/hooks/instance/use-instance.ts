import { useQuery } from '@tanstack/react-query';
import { instanceSchema } from 'pl-api';
import * as v from 'valibot';

import { useClient } from 'pl-fe/hooks/use-client';
import { initialState } from 'pl-fe/initial-state';

const placeholderData = v.parse(instanceSchema, {});
const initialData = initialState['/api/v1/instance'] ? v.parse(instanceSchema, initialState['/api/v1/instance']) : undefined;

const useInstance = () => {
  const client = useClient();

  const query = useQuery({
    queryKey: ['instance', 'instanceInformation', client.baseURL],
    queryFn: client.instance.getInstance,
    initialData: client.baseURL === '' ? initialData : undefined,
  });

  return { ...query, data: query.data || placeholderData };
};

export { useInstance };
