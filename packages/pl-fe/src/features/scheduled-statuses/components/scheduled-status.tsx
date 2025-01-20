import clsx from 'clsx';
import React from 'react';

import Account from 'pl-fe/components/account';
import AttachmentThumbs from 'pl-fe/components/attachment-thumbs';
import StatusContent from 'pl-fe/components/status-content';
import StatusReplyMentions from 'pl-fe/components/status-reply-mentions';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import PollPreview from 'pl-fe/features/ui/components/poll-preview';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

import { buildStatus } from '../builder';

import ScheduledStatusActionBar from './scheduled-status-action-bar';

import type { ScheduledStatus as ScheduledStatusEntity } from 'pl-api';

interface IScheduledStatus {
  scheduledStatus: ScheduledStatusEntity;
}

const ScheduledStatus: React.FC<IScheduledStatus> = ({ scheduledStatus, ...other }) => {
  const status = useAppSelector((state) => {
    if (!scheduledStatus) return null;
    return buildStatus(state, scheduledStatus);
  });

  if (!status) return null;

  const account = status.account;

  return (
    <div className={clsx('status__wrapper py-4', `status__wrapper-${status.visibility}`, { 'status__wrapper-reply': !!status.in_reply_to_id })} tabIndex={0}>
      <div className={clsx('status', `status-${status.visibility}`, { 'status-reply': !!status.in_reply_to_id })} data-id={status.id}>
        <div className='mb-4'>
          <HStack justifyContent='between' alignItems='start'>
            <Account
              key={account.id}
              account={account}
              timestamp={status.created_at}
              futureTimestamp
              action={<ScheduledStatusActionBar status={status} {...other} />}
            />
          </HStack>
        </div>

        <StatusReplyMentions status={status} />

        <Stack space={4}>
          <StatusContent
            status={status}
            collapsable={false}
          />

          {status.media_attachments.length > 0 && (
            <AttachmentThumbs
              status={status}
            />
          )}

          {status.poll && <PollPreview poll={status.poll} />}
        </Stack>
      </div>
    </div>
  );
};

export { ScheduledStatus as default };
