import React from 'react';
import { FormattedList, FormattedMessage } from 'react-intl';

import { useCompose } from 'pl-fe/hooks/use-compose';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useModalsStore } from 'pl-fe/stores/modals';
import { useSettingsStore } from 'pl-fe/stores/settings';

interface IReplyMentions {
  composeId: string;
}

const ReplyMentions: React.FC<IReplyMentions> = ({ composeId }) => {
  const { openModal } = useModalsStore();
  const features = useFeatures();
  const compose = useCompose(composeId);
  const to = compose.to;

  const { forceImplicitAddressing } = useSettingsStore().settings;
  const explicitAddressing = features.createStatusExplicitAddressing && !forceImplicitAddressing;

  if (!explicitAddressing || !compose.in_reply_to || !to) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    openModal('REPLY_MENTIONS', {
      composeId,
    });
  };

  if (!compose.parent_reblogged_by && to.length === 0) {
    return null;
  }

  if (to.length === 0) {
    return (
      <a href='#' className='mb-1 text-sm text-gray-700 dark:text-gray-600' onClick={handleClick}>
        <FormattedMessage
          id='reply_mentions.reply_empty'
          defaultMessage='Replying to post'
        />
      </a>
    );
  }

  const accounts = to.slice(0, 2).map((acct: string) => {
    const username = acct.split('@')[0];
    return (
      <span
        key={acct}
        className='inline-block text-primary-600 no-underline [direction:ltr] hover:text-primary-700 hover:underline dark:text-accent-blue dark:hover:text-accent-blue'
      >
        @{username}
      </span>
    );
  });

  if (to.length > 2) {
    accounts.push(
      <FormattedMessage id='reply_mentions.more' defaultMessage='{count} more' values={{ count: to.length - 2 }} />,
    );
  }

  return (
    <a href='#' className='mb-1 text-sm text-gray-700 dark:text-gray-600' onClick={handleClick}>
      <FormattedMessage
        id='reply_mentions.reply'
        defaultMessage='Replying to {accounts}'
        values={{
          accounts: <FormattedList type='conjunction' value={accounts} />,
        }}
      />
    </a>
  );
};

export { ReplyMentions as default };
