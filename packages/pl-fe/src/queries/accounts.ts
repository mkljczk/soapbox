import { useMutation } from '@tanstack/react-query';

import { patchMeSuccess } from 'pl-fe/actions/me';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';
import toast from 'pl-fe/toast';

type UpdateCredentialsData = {
  accepts_chat_messages?: boolean;
}

const useUpdateCredentials = () => {
  // const { account } = useOwnAccount();
  const client = useClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: UpdateCredentialsData) => client.settings.updateCredentials(data),
    // TODO: What is it intended to do?
    // onMutate(variables) {
    //   const cachedAccount = account;
    //   dispatch(patchMeSuccess({ ...account, ...variables }));

    //   return { cachedAccount };
    // },
    onSuccess(response) {
      dispatch(patchMeSuccess(response));
      toast.success('Chat Settings updated successfully');
    },
    onError(_error, _variables, context: any) {
      toast.error('Chat Settings failed to update.');
      dispatch(patchMeSuccess(context.cachedAccount));
    },
  });
};

export { useUpdateCredentials };
