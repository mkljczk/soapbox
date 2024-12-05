import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import Modal from 'pl-fe/components/ui/modal';
import Spinner from 'pl-fe/components/ui/spinner';
import AccountContainer from 'pl-fe/containers/account-container';
import { useStatusFavourites } from 'pl-fe/queries/statuses/use-status-interactions';

import type { BaseModalProps } from '../modal-root';

interface FavouritesModalProps {
  statusId: string;
}

const FavouritesModal: React.FC<BaseModalProps & FavouritesModalProps> = ({ onClose, statusId }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const { data: accountIds, isLoading, hasNextPage, fetchNextPage } = useStatusFavourites(statusId);

  const onClickClose = () => {
    onClose('FAVOURITES');
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = <FormattedMessage id='empty_column.favourites' defaultMessage='No one has liked this post yet. When someone does, they will show up here.' />;

    body = (
      <ScrollableList
        emptyMessage={emptyMessage}
        listClassName='max-w-full'
        itemClassName='pb-3'
        style={{ height: 'calc(80vh - 88px)' }}
        hasMore={hasNextPage}
        isLoading={typeof isLoading === 'boolean' ? isLoading : true}
        onLoadMore={() => fetchNextPage({ cancelRefetch: false })}
        estimatedSize={42}
        parentRef={modalRef}
      >
        {accountIds.map(id =>
          <AccountContainer key={id} id={id} />,
        )}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.favourites' defaultMessage='Likes' />}
      onClose={onClickClose}
      ref={modalRef}
    >
      {body}
    </Modal>
  );
};

export { FavouritesModal as default, type FavouritesModalProps };
