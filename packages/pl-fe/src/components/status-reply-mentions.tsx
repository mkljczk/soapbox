import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedList, FormattedMessage } from 'react-intl';

import HoverAccountWrapper from 'pl-fe/components/hover-account-wrapper';
import HoverStatusWrapper from 'pl-fe/components/hover-status-wrapper';
import { useModalsStore } from 'pl-fe/stores/modals';

import type { Status } from 'pl-fe/normalizers/status';

interface IStatusReplyMentions {
  status: Pick<Status, 'in_reply_to_id' | 'id' | 'mentions'>;
  hoverable?: boolean;
}

const StatusReplyMentions: React.FC<IStatusReplyMentions> = ({ status, hoverable = true }) => {
  const { openModal } = useModalsStore();

  const handleOpenMentionsModal: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.stopPropagation();

    openModal('MENTIONS', { statusId: status.id });
  };

  if (!status.in_reply_to_id) {
    return null;
  }

  const to = status.mentions;

  // The post is a reply, but it has no mentions.
  // Rare, but it can happen.
  if (to.length === 0) {
    return (
      <div className='mb-1 block text-sm text-gray-700 dark:text-gray-600'>
        <FormattedMessage
          id='reply_mentions.reply_empty'
          defaultMessage='Replying to post'
        />
      </div>
    );
  }

  // The typical case with a reply-to and a list of mentions.
  const accounts = to.slice(0, 2).map(account => {
    const link = (
      <Link
        key={account.id}
        to={`/@${account.acct}`}
        className='inline-block max-w-[200px] truncate align-bottom text-primary-600 no-underline [direction:ltr] hover:text-primary-700 hover:underline dark:text-accent-blue dark:hover:text-accent-blue'
        onClick={(e) => e.stopPropagation()}
      >
        @{account.username}
      </Link>
    );

    if (hoverable) {
      return (
        <HoverAccountWrapper key={account.id} accountId={account.id} element='span'>
          {link}
        </HoverAccountWrapper>
      );
    } else {
      return link;
    }
  });

  if (to.length > 2) {
    accounts.push(
      <span key='more' className='cursor-pointer hover:underline' role='button' onClick={handleOpenMentionsModal} tabIndex={0}>
        <FormattedMessage id='reply_mentions.more' defaultMessage='{count} more' values={{ count: to.length - 2 }} />
      </span>,
    );
  }

  return (
    <div className='mb-1 block text-sm text-gray-700 dark:text-gray-600'>
      <FormattedMessage
        id='reply_mentions.reply.hoverable'
        defaultMessage='<hover>Replying to</hover> {accounts}'
        values={{
          accounts: <FormattedList type='conjunction' value={accounts} />,
          // @ts-ignore wtf?
          hover: (children: React.ReactNode) => {
            if (hoverable && status.in_reply_to_id) {
              return (
                <HoverStatusWrapper statusId={status.in_reply_to_id} inline>
                  <span
                    key='hoverstatus'
                    className='cursor-pointer hover:underline'
                    role='presentation'
                  >
                    {children}
                  </span>
                </HoverStatusWrapper>
              );
            } else {
              return children;
            }
          },
        }}
      />
    </div>
  );
};

export { StatusReplyMentions as default };
