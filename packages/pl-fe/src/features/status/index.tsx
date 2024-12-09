import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Redirect } from 'react-router-dom';

import { fetchContext } from 'pl-fe/actions/statuses';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import Column from 'pl-fe/components/ui/column';
import Stack from 'pl-fe/components/ui/stack';
import PlaceholderStatus from 'pl-fe/features/placeholder/components/placeholder-status';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';
import { statusQueryOptions } from 'pl-fe/queries/statuses/status';

import Thread from './components/thread';
import ThreadLoginCta from './components/thread-login-cta';

const messages = defineMessages({
  title: { id: 'status.title', defaultMessage: 'Post details' },
  titleDirect: { id: 'status.title_direct', defaultMessage: 'Direct message' },
  deleteConfirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
  deleteHeading: { id: 'confirmations.delete.heading', defaultMessage: 'Delete post' },
  deleteMessage: { id: 'confirmations.delete.message', defaultMessage: 'Are you sure you want to delete this post?' },
  redraftConfirm: { id: 'confirmations.redraft.confirm', defaultMessage: 'Delete & redraft' },
  redraftHeading: { id: 'confirmations.redraft.heading', defaultMessage: 'Delete & redraft' },
  redraftMessage: { id: 'confirmations.redraft.message', defaultMessage: 'Are you sure you want to delete this post and re-draft it? Favorites and reposts will be lost, and replies to the original post will be orphaned.' },
  blockConfirm: { id: 'confirmations.block.confirm', defaultMessage: 'Block' },
  revealAll: { id: 'status.show_more_all', defaultMessage: 'Show more for all' },
  hideAll: { id: 'status.show_less_all', defaultMessage: 'Show less for all' },
  detailedStatus: { id: 'status.detailed_status', defaultMessage: 'Detailed conversation view' },
  replyConfirm: { id: 'confirmations.reply.confirm', defaultMessage: 'Reply' },
  replyMessage: { id: 'confirmations.reply.message', defaultMessage: 'Replying now will overwrite the message you are currently composing. Are you sure you want to proceed?' },
  blockAndReport: { id: 'confirmations.block.block_and_report', defaultMessage: 'Block and report' },
});

type RouteParams = {
  statusId: string;
  groupId?: string;
};

interface IStatusDetails {
  params: RouteParams;
}

const StatusDetails: React.FC<IStatusDetails> = (props) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { isLoggedIn } = useLoggedIn();

  const { data: status } = useQuery(statusQueryOptions(props.params.statusId));

  const [isLoaded, setIsLoaded] = useState<boolean>(!!status);

  /** Fetch the status (and context) from the API. */
  const fetchData = () => {
    const { params } = props;
    const { statusId } = params;
    return dispatch(fetchContext(statusId, intl));
  };

  // Load data.
  useEffect(() => {
    fetchData().then(() => {
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, [props.params.statusId]);

  const handleRefresh = () => fetchData();

  if (status?.event) {
    return (
      <Redirect to={`/@${status.account.acct}/events/${status.id}`} />
    );
  }

  if (!status && isLoaded) {
    return (
      <MissingIndicator />
    );
  } else if (!status) {
    return (
      <Column>
        <PlaceholderStatus />
      </Column>
    );
  }

  if (status.group && typeof status.group === 'object') {
    if (status.group.id && !props.params.groupId) {
      return <Redirect to={`/groups/${status.group.id}/posts/${props.params.statusId}`} />;
    }
  }

  const titleMessage = () => {
    if (status.visibility === 'direct') return messages.titleDirect;
    return messages.title;
  };

  return (
    <Stack space={4}>
      <Column label={intl.formatMessage(titleMessage())}>
        <PullToRefresh onRefresh={handleRefresh}>
          <Thread status={status} />
        </PullToRefresh>
      </Column>

      {!isLoggedIn && <ThreadLoginCta />}
    </Stack>
  );
};

export { StatusDetails as default };
