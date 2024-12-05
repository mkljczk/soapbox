import clsx from 'clsx';
import React from 'react';

import AttachmentThumbs from 'pl-fe/components/attachment-thumbs';
import Markup from 'pl-fe/components/markup';
import { ParsedContent } from 'pl-fe/components/parsed-content';
import Stack from 'pl-fe/components/ui/stack';
import AccountContainer from 'pl-fe/containers/account-container';
import { getTextDirection } from 'pl-fe/utils/rtl';

import type { Status } from 'pl-fe/normalizers/status';

interface IReplyIndicator {
  className?: string;
  status?: Pick<Status, 'account_id' | 'content' | 'created_at' | 'emojis' | 'media_attachments' | 'mentions' | 'search_index' | 'sensitive' | 'spoiler_text' | 'quote_id'>;
  onCancel?: () => void;
  hideActions: boolean;
}

const ReplyIndicator: React.FC<IReplyIndicator> = ({ className, status, hideActions, onCancel }) => {
  const handleClick = () => {
    onCancel!();
  };

  if (!status) {
    return null;
  }

  let actions = {};
  if (!hideActions && onCancel) {
    actions = {
      onActionClick: handleClick,
      actionIcon: require('@tabler/icons/outline/x.svg'),
      actionAlignment: 'top',
      actionTitle: 'Dismiss',
    };
  }

  return (
    <Stack space={2} className={clsx('max-h-72 overflow-y-auto rounded-lg bg-gray-100 p-4 black:bg-gray-900 dark:bg-gray-800', className)}>
      <AccountContainer
        {...actions}
        id={status.account_id}
        timestamp={status.created_at}
        showAccountHoverCard={false}
        withLinkToProfile={false}
        hideActions={hideActions}
      />

      <Markup
        className='break-words'
        size='sm'
        direction={getTextDirection(status.search_index)}
      >
        <ParsedContent html={status.content} mentions={status.mentions} hasQuote={!!status.quote_id} emojis={status.emojis} />
      </Markup>

      {status.media_attachments.length > 0 && (
        <AttachmentThumbs
          status={status}
        />
      )}
    </Stack>
  );
};

export { ReplyIndicator as default };
