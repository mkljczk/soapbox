import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Account from 'pl-fe/components/account';
import AttachmentThumbs from 'pl-fe/components/attachment-thumbs';
import StatusContent from 'pl-fe/components/status-content';
import StatusReplyMentions from 'pl-fe/components/status-reply-mentions';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import QuotedStatus from 'pl-fe/features/status/containers/quoted-status-container';
import PollPreview from 'pl-fe/features/ui/components/poll-preview';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

import { buildStatus } from '../builder';

import DraftStatusActionBar from './draft-status-action-bar';

import type { Status as StatusEntity } from 'pl-fe/normalizers/status';
import type { DraftStatus as DraftStatusType } from 'pl-fe/reducers/draft-statuses';

interface IDraftStatus {
  draftStatus: DraftStatusType;
}

const DraftStatus: React.FC<IDraftStatus> = ({ draftStatus, ...other }) => {
  const status = useAppSelector((state) => {
    if (!draftStatus) return null;
    return buildStatus(state, draftStatus);
  }) as StatusEntity | null;

  if (!status) return null;

  const account = status.account;

  let quote;

  if (status.quote_id) {
    if ((status.quote_visible ?? true) === false) {
      quote = (
        <div className='quoted-status-tombstone'>
          <p><FormattedMessage id='statuses.quote_tombstone' defaultMessage='Post is unavailable.' /></p>
        </div>
      );
    } else {
      quote = <QuotedStatus statusId={status.quote_id} />;
    }
  }

  return (
    <div className={clsx('status__wrapper py-4', `status__wrapper-${status.visibility}`, { 'status__wrapper-reply': !!status.in_reply_to_id })} tabIndex={0}>
      <div className={clsx('status', `status-${status.visibility}`, { 'status-reply': !!status.in_reply_to_id })} data-id={status.id}>
        <div className='mb-4'>
          <HStack justifyContent='between' alignItems='start'>
            <Account
              key={account.id}
              account={account}
              action={<DraftStatusActionBar source={draftStatus} status={status} {...other} />}
            />
          </HStack>
        </div>

        <StatusReplyMentions status={status} />

        <Stack space={4}>
          <StatusContent
            status={status}
            collapsable
          />

          {status.media_attachments.length > 0 && (
            <AttachmentThumbs
              status={status}
            />
          )}

          {quote}

          {status.poll && <PollPreview poll={status.poll} />}
        </Stack>
      </div>
    </div>
  );
};

export { DraftStatus as default };
