import clsx from 'clsx';
import React, { MouseEventHandler } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import StatusMedia from 'pl-fe/components/status-media';
import Stack from 'pl-fe/components/ui/stack';
import AccountContainer from 'pl-fe/containers/account-container';

import EventPreview from './event-preview';
import OutlineBox from './outline-box';
import QuotedStatusIndicator from './quoted-status-indicator';
import StatusContent from './status-content';
import StatusReplyMentions from './status-reply-mentions';
import SensitiveContentOverlay from './statuses/sensitive-content-overlay';

import type { UseStatusData as Status } from 'pl-hooks';

const messages = defineMessages({
  cancel: { id: 'reply_indicator.cancel', defaultMessage: 'Cancel' },
});

interface IQuotedStatus {
  /** The quoted status entity. */
  status?: Status;
  /** Callback when cancelled (during compose). */
  onCancel?: Function;
  /** Whether the status is shown in the post composer. */
  compose?: boolean;
}

/** Status embedded in a quote post. */
const QuotedStatus: React.FC<IQuotedStatus> = ({ status, onCancel, compose }) => {
  const intl = useIntl();
  const history = useHistory();

  const handleExpandClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!status) return;
    const account = status.account;

    if (!compose && e.button === 0) {
      const statusUrl = `/@${account.acct}/posts/${status.id}`;
      if (!(e.ctrlKey || e.metaKey)) {
        history.push(statusUrl);
      } else {
        window.open(statusUrl, '_blank');
      }
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    }
  };

  if (!status) {
    return null;
  }

  const account = status.account;

  let actions = {};
  if (onCancel) {
    actions = {
      onActionClick: handleClose,
      actionIcon: require('@tabler/icons/outline/x.svg'),
      actionAlignment: 'top',
      actionTitle: intl.formatMessage(messages.cancel),
    };
  }

  return (
    <OutlineBox
      data-testid='quoted-status'
      className={clsx('cursor-pointer', {
        'group hover:bg-gray-100 dark:hover:bg-gray-800': !compose,
      })}
    >
      <Stack
        space={2}
        onClick={handleExpandClick}
      >
        <AccountContainer
          {...actions}
          id={account.id}
          timestamp={status.created_at}
          withRelationship={false}
          showAccountHoverCard={!compose}
          withLinkToProfile={!compose}
        />

        <StatusReplyMentions status={status} hoverable={false} />

        {status.event ? <EventPreview status={status} hideAction /> : (
          <Stack className='relative z-0'>
            <Stack space={4}>
              <StatusContent
                status={status}
                collapsable
                isQuote
              />

              {status.quote_id && <QuotedStatusIndicator statusId={status.quote_id} />}

              {status.media_attachments.length > 0 && (
                <div className='relative'>
                  <SensitiveContentOverlay status={status} />
                  <StatusMedia status={status} muted={compose} />
                </div>
              )}
            </Stack>
          </Stack>
        )}
      </Stack>
    </OutlineBox>
  );
};

export { QuotedStatus as default };
