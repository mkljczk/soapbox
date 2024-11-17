import clsx from 'clsx';
import React from 'react';

import Account from 'pl-fe/components/account';
import StatusContent from 'pl-fe/components/status-content';
import StatusReplyMentions from 'pl-fe/components/status-reply-mentions';
import Card from 'pl-fe/components/ui/card';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import PlaceholderCard from 'pl-fe/features/placeholder/components/placeholder-card';
import PlaceholderMediaGallery from 'pl-fe/features/placeholder/components/placeholder-media-gallery';
import QuotedStatus from 'pl-fe/features/status/containers/quoted-status-container';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

import { buildStatus } from '../util/pending-status-builder';

import PollPreview from './poll-preview';

import type { Status as StatusEntity } from 'pl-fe/normalizers/status';

const shouldHaveCard = (pendingStatus: StatusEntity) => Boolean(pendingStatus.content.match(/https?:\/\/\S*/));

interface IPendingStatus {
  className?: string;
  idempotencyKey: string;
  muted?: boolean;
  variant?: 'default' | 'rounded' | 'slim';
}

interface IPendingStatusMedia {
  status: StatusEntity;
}

const PendingStatusMedia: React.FC<IPendingStatusMedia> = ({ status }) => {
  if (status.media_attachments && status.media_attachments.length) {
    return (
      <PlaceholderMediaGallery
        media={status.media_attachments}
      />
    );
  } else if (!status.quote && shouldHaveCard(status)) {
    return <PlaceholderCard />;
  } else {
    return null;
  }
};

const PendingStatus: React.FC<IPendingStatus> = ({ idempotencyKey, className, muted, variant = 'rounded' }) => {
  const status = useAppSelector((state) => {
    const pendingStatus = state.pending_statuses[idempotencyKey];
    return pendingStatus ? buildStatus(state, pendingStatus, idempotencyKey) : null;
  });

  if (!status) return null;
  if (!status.account) return null;

  const account = status.account;

  return (
    <div className={clsx('opacity-50', className)}>
      <div className={clsx('status', { 'status-reply': !!status.in_reply_to_id, muted })} data-id={status.id}>
        <Card
          className={clsx(`status-${status.visibility}`, {
            'py-6 sm:p-5': variant === 'rounded',
            'status-reply': !!status.in_reply_to_id,
          })}
          variant={variant}
        >
          <div className='mb-4'>
            <HStack justifyContent='between' alignItems='start'>
              <Account
                key={account.id}
                account={account}
                timestamp={status.created_at}
                hideActions
                withLinkToProfile={false}
              />
            </HStack>
          </div>

          <div className='status__content-wrapper'>
            <StatusReplyMentions status={status} />

            <Stack space={4}>
              <StatusContent
                status={status}
                collapsable
              />

              <PendingStatusMedia status={status} />

              {status.poll && <PollPreview poll={status.poll} />}

              {status.quote_id && <QuotedStatus statusId={status.quote_id} />}
            </Stack>
          </div>

          {/* TODO */}
          {/* <PlaceholderActionBar /> */}
        </Card>
      </div>
    </div>
  );
};

export { PendingStatus as default };
