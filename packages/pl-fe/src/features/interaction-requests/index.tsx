import clsx from 'clsx';
import { type MinifiedInteractionRequest, useAuthorizeInteractionRequestMutation, useFlatInteractionRequests, useRejectInteractionRequestMutation } from 'pl-hooks';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import AttachmentThumbs from 'pl-fe/components/attachment-thumbs';
import Icon from 'pl-fe/components/icon';
import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import RelativeTimestamp from 'pl-fe/components/relative-timestamp';
import ScrollableList from 'pl-fe/components/scrollable-list';
import StatusContent from 'pl-fe/components/status-content';
import Button from 'pl-fe/components/ui/button';
import Column from 'pl-fe/components/ui/column';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import AccountContainer from 'pl-fe/containers/account-container';
import { buildLink } from 'pl-fe/features/notifications/components/notification';
import { HotKeys } from 'pl-fe/features/ui/components/hotkeys';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import toast from 'pl-fe/toast';

const messages = defineMessages({
  title: { id: 'column.interaction_requests', defaultMessage: 'Interaction requests' },
  favourite: { id: 'interaction_request.favourite', defaultMessage: '{name} wants to like your <link>post</link>' },
  reply: { id: 'interaction_request.reply', defaultMessage: '{name} wants to reply to your <link>post</link>' },
  reblog: { id: 'interaction_request.reblog', defaultMessage: '{name} wants to repost your <link>post</link>' },
  authorize: { id: 'interaction_request.authorize', defaultMessage: 'Accept' },
  reject: { id: 'interaction_request.reject', defaultMessage: 'Reject' },
  authorized: { id: 'interaction_request.authorize.success', defaultMessage: 'Authorized @{acct} interaction request' },
  authorizeFail: { id: 'interaction_request.authorize.fail', defaultMessage: 'Failed to authorize @{acct} interaction request' },
  rejected: { id: 'interaction_request.reject.success', defaultMessage: 'Rejected @{acct} interaction request' },
  rejectFail: { id: 'interaction_request.reject.fail', defaultMessage: 'Failed to reject @{acct} interaction request' },
});

const icons = {
  favourite: require('@tabler/icons/outline/star.svg'),
  reblog: require('@tabler/icons/outline/repeat.svg'),
  reply: require('@tabler/icons/outline/corner-up-left.svg'),
};

const avatarSize = 42;

interface IInteractionRequestStatus {
  id: string;
  hasReply?: boolean;
  isReply?: boolean;
  actions?: JSX.Element;
}

const InteractionRequestStatus: React.FC<IInteractionRequestStatus> = ({ id: statusId, hasReply, isReply, actions }) => {
  const status = useAppSelector((state) => state.statuses[statusId]);

  if (!status) return null;

  return (
    <Stack className='relative py-2' space={2}>
      {hasReply && (
        <div
          className='absolute left-5 top-[62px] z-[1] block h-[calc(100%-58px)] w-0.5 bg-gray-200 black:bg-gray-800 dark:bg-primary-800 rtl:left-auto rtl:right-5'
        />
      )}

      <AccountContainer
        id={status.account_id}
        showAccountHoverCard={false}
        withLinkToProfile={false}
        timestamp={status.created_at}
        action={actions || <></>}
      />

      <Stack space={2} className={clsx(hasReply && 'pl-[54px]')}>
        <StatusContent status={status} preview={!isReply} />

        {status.media_attachments.length > 0 && (
          <AttachmentThumbs status={status} />
        )}
      </Stack>
    </Stack>
  );
};

interface IInteractionRequest {
  interactionRequest: MinifiedInteractionRequest;
  onMoveUp?: (requestId: string) => void;
  onMoveDown?: (requestId: string) => void;
}

const InteractionRequest: React.FC<IInteractionRequest> = ({
  interactionRequest, onMoveUp, onMoveDown,
}) => {
  const intl = useIntl();
  const { account: ownAccount } = useOwnAccount();
  const { account } = useAccount(interactionRequest.account_id);

  const { mutate: authorize } = useAuthorizeInteractionRequestMutation(interactionRequest.id);
  const { mutate: reject } = useRejectInteractionRequestMutation(interactionRequest.id);

  const handleAuthorize = () => {
    authorize(undefined, {
      onSuccess: () => toast.success(intl.formatMessage(messages.authorized, {
        acct: account?.acct,
      })),
      onError: () => toast.error(intl.formatMessage(messages.authorizeFail, {
        acct: account?.acct,
      })),
    });
  };

  const handleReject = () => {
    reject(undefined, {
      onSuccess: () => toast.success(intl.formatMessage(messages.rejected, {
        acct: account?.acct,
      })),
      onError: () => toast.error(intl.formatMessage(messages.rejectFail, {
        acct: account?.acct,
      })),
    });
  };

  if (interactionRequest.accepted_at || interactionRequest.rejected_at) return null;

  const message = intl.formatMessage(messages[interactionRequest.type], {
    name: account && buildLink(account),
    link: (children: React.ReactNode) => {
      if (interactionRequest.status_id) {
        return (
          <Link className='font-bold text-gray-800 hover:underline dark:text-gray-200' to={`/@${ownAccount?.acct}/posts/${interactionRequest.status_id}`}>
            {children}
          </Link>
        );
      }

      return children;
    },
  });

  const actions = (
    <HStack space={2}>
      <Button
        theme='secondary'
        size='sm'
        text={intl.formatMessage(messages.authorize)}
        onClick={() => handleAuthorize()}
      />
      <Button
        theme='danger'
        size='sm'
        text={intl.formatMessage(messages.reject)}
        onClick={() => handleReject()}
      />
    </HStack>
  );

  const handleMoveUp = () => {
    if (onMoveUp) {
      onMoveUp(interactionRequest.id);
    }
  };

  const handleMoveDown = () => {
    if (onMoveDown) {
      onMoveDown(interactionRequest.id);
    }
  };

  const handlers = {
    moveUp: handleMoveUp,
    moveDown: handleMoveDown,
  };

  return (
    <HotKeys handlers={handlers}>
      <div className='notification focusable' tabIndex={0}>
        <div className='focusable p-4'>
          <Stack space={2}>
            <div>
              <HStack alignItems='center' space={3}>
                <div
                  className='flex justify-end'
                  style={{ flexBasis: avatarSize }}
                >
                  <Icon
                    src={icons[interactionRequest.type]}
                    className='flex-none text-primary-600 dark:text-primary-400'
                  />
                </div>

                <div className='truncate'>
                  <Text theme='muted' size='xs' truncate>
                    {message}
                  </Text>
                </div>

                {interactionRequest.type !== 'reply' && (
                  <div className='ml-auto'>
                    <Text theme='muted' size='xs' truncate>
                      <RelativeTimestamp timestamp={interactionRequest.created_at} theme='muted' size='sm' className='whitespace-nowrap' />
                    </Text>
                  </div>
                )}
              </HStack>
            </div>

            {interactionRequest.status_id && <InteractionRequestStatus id={interactionRequest.status_id} hasReply={interactionRequest.type === 'reply'} actions={interactionRequest.reply_id ? undefined : actions} />}
            {interactionRequest.reply_id && <InteractionRequestStatus id={interactionRequest.reply_id} isReply actions={actions} />}
          </Stack>
        </div>
      </div>
    </HotKeys>
  );
};

const InteractionRequests = () => {
  const intl = useIntl();

  const { data = [], fetchNextPage, hasNextPage, isFetching, isLoading, refetch } = useFlatInteractionRequests();

  const emptyMessage = <FormattedMessage id='empty_column.interaction_requests' defaultMessage='There are no pending interaction requests.' />;

  const handleMoveUp = (id: string) => {
    const elementIndex = data.findIndex(item => item !== null && item.id === id) - 1;
    _selectChild(elementIndex);
  };

  const handleMoveDown = (id: string) => {
    const elementIndex = data.findIndex(item => item !== null && item.id === id) + 1;
    _selectChild(elementIndex);
  };

  const _selectChild = (index: number) => {
    const selector = `[data-index="${index}"] .focusable`;
    const element = document.querySelector<HTMLDivElement>(selector);

    if (element) element.focus();
  };

  return (
    <Column label={intl.formatMessage(messages.title)} withHeader={false}>
      <PullToRefresh onRefresh={() => refetch()}>
        <ScrollableList
          isLoading={isFetching}
          showLoading={isLoading}
          hasMore={hasNextPage}
          emptyMessage={emptyMessage}
          onLoadMore={() => fetchNextPage()}
          listClassName={clsx('divide-y divide-solid divide-gray-200 black:divide-gray-800 dark:divide-primary-800', {
            'animate-pulse': data?.length === 0,
          })}
        >
          {data?.map(request => (
            <InteractionRequest
              key={request.id}
              interactionRequest={request}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </ScrollableList>
      </PullToRefresh>
    </Column>
  );
};

export { InteractionRequests as default };
