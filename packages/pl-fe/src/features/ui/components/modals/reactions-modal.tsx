import clsx from 'clsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { fetchReactions } from 'pl-fe/actions/interactions';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Emoji from 'pl-fe/components/ui/emoji';
import Modal from 'pl-fe/components/ui/modal';
import Spinner from 'pl-fe/components/ui/spinner';
import Tabs from 'pl-fe/components/ui/tabs';
import AccountContainer from 'pl-fe/containers/account-container';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

import type { BaseModalProps } from '../modal-root';
import type { Item } from 'pl-fe/components/ui/tabs';

const messages = defineMessages({
  all: { id: 'reactions.all', defaultMessage: 'All' },
});

interface IAccountWithReaction {
  id: string;
  reaction: string;
  reactionUrl?: string;
}

interface ReactionsModalProps {
  statusId: string;
  reaction?: string;
}

const ReactionsModal: React.FC<BaseModalProps & ReactionsModalProps> = ({ onClose, statusId, reaction: initialReaction }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [reaction, setReaction] = useState(initialReaction);
  const reactions = useAppSelector((state) => state.user_lists.reactions[statusId]?.items);

  const onClickClose = () => {
    onClose('REACTIONS');
  };

  const renderFilterBar = () => {
    const items: Array<Item> = [
      {
        text: intl.formatMessage(messages.all),
        action: () => setReaction(''),
        name: 'all',
      },
    ];

    reactions!.forEach(reaction => items.push(
      {
        text: <div className='flex items-center gap-1'>
          <Emoji className='size-4' emoji={reaction.name} src={reaction.url || undefined} />
          {reaction.count}
        </div>,
        action: () => setReaction(reaction.name),
        name: reaction.name,
      },
    ));

    return <Tabs items={items} activeItem={reaction || 'all'} />;
  };

  const accounts = useMemo((): Array<IAccountWithReaction> | undefined => {
    if (!reactions) return;

    if (reaction) {
      const reactionRecord = reactions.find(({ name }) => name === reaction);

      if (reactionRecord) return reactionRecord.accounts.map(account => ({ id: account, reaction: reaction, reactionUrl: reactionRecord.url || undefined }));
    } else {
      return reactions.map(({ accounts, name, url }) => accounts.map(account => ({ id: account, reaction: name, reactionUrl: url || undefined }))).flat();
    }
  }, [reactions, reaction]);

  useEffect(() => {
    dispatch(fetchReactions(statusId));
  }, []);

  let body;

  if (!accounts || !reactions) {
    body = <Spinner />;
  } else {
    const emptyMessage = <FormattedMessage id='status.reactions.empty' defaultMessage='No one has reacted to this post yet. When someone does, they will show up here.' />;

    body = (<>
      {reactions.length > 0 && renderFilterBar()}
      <ScrollableList
        emptyMessage={emptyMessage}
        listClassName={clsx('max-w-full', {
          'mt-4': reactions.length > 0,
        })}
        itemClassName='pb-3'
        style={{ height: 'calc(80vh - 88px)' }}
        estimatedSize={42}
        parentRef={modalRef}
      >
        {accounts.map((account) =>
          <AccountContainer key={`${account.id}-${account.reaction}`} id={account.id} emoji={account.reaction} emojiUrl={account.reactionUrl} />,
        )}
      </ScrollableList>
    </>);
  }

  return (
    <Modal
      title={<FormattedMessage id='column.reactions' defaultMessage='Reactions' />}
      onClose={onClickClose}
      ref={modalRef}
    >
      {body}
    </Modal>
  );
};

export { ReactionsModal as default, type ReactionsModalProps };
