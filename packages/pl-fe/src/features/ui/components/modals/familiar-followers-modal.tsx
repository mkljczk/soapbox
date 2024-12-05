import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import { useFamiliarFollowers } from 'pl-fe/api/hooks/account-lists/use-familiar-followers';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Modal from 'pl-fe/components/ui/modal';
import Spinner from 'pl-fe/components/ui/spinner';
import AccountContainer from 'pl-fe/containers/account-container';
import Emojify from 'pl-fe/features/emoji/emojify';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { makeGetAccount } from 'pl-fe/selectors';

import type { BaseModalProps } from '../modal-root';

const getAccount = makeGetAccount();

interface FamiliarFollowersModalProps {
  accountId: string;
}

const FamiliarFollowersModal: React.FC<BaseModalProps & FamiliarFollowersModalProps> = ({ accountId, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const account = useAppSelector(state => getAccount(state, accountId));
  const { data: familiarFollowerIds } = useFamiliarFollowers(accountId);

  const onClickClose = () => {
    onClose('FAMILIAR_FOLLOWERS');
  };

  let body;

  if (!account || !familiarFollowerIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = (
      <FormattedMessage
        id='account.familiar_followers.empty'
        defaultMessage='No one you know follows {name}.'
        values={{ name: <span><Emojify text={account.display_name} emojis={account.emojis} /></span> }}
      />
    );

    body = (
      <ScrollableList
        emptyMessage={emptyMessage}
        itemClassName='pb-3'
        style={{ height: 'calc(80vh - 88px)' }}
        estimatedSize={42}
        parentRef={modalRef}
      >
        {familiarFollowerIds.map(id =>
          <AccountContainer key={id} id={id} />,
        )}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={
        <FormattedMessage
          id='column.familiar_followers'
          defaultMessage='People you know following {name}'
          values={{ name: !!account && <span><Emojify text={account.display_name} emojis={account.emojis} /></span> }}
        />
      }
      onClose={onClickClose}
      ref={modalRef}
    >
      {body}
    </Modal>
  );
};

export { FamiliarFollowersModal as default, type FamiliarFollowersModalProps };
