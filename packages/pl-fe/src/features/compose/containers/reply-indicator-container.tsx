import { useStatus } from 'pl-hooks';
import React from 'react';

import { cancelReplyCompose } from 'pl-fe/actions/compose';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';

import ReplyIndicator from '../components/reply-indicator';

interface IReplyIndicatorContainer {
  composeId: string;
}

const ReplyIndicatorContainer: React.FC<IReplyIndicatorContainer> = ({ composeId }) => {
  const { in_reply_to: inReplyToId, id: statusId } = useCompose(composeId);
  const { data: status } = useStatus(inReplyToId!);
  const dispatch = useAppDispatch();

  const onCancel = () => {
    dispatch(cancelReplyCompose());
  };

  if (!status) return null;

  return (
    <ReplyIndicator status={status.account} hideActions={!!statusId} onCancel={onCancel} />
  );
};

export { ReplyIndicatorContainer as default };
