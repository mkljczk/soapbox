import clsx from 'clsx';
import React, { useRef } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { cancelReplyCompose, uploadCompose } from 'pl-fe/actions/compose';
import { saveDraftStatus } from 'pl-fe/actions/draft-statuses';
import { checkComposeContent } from 'pl-fe/components/modal-root';
import Modal from 'pl-fe/components/ui/modal';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';
import { useDraggedFiles } from 'pl-fe/hooks/use-dragged-files';
import { useModalsStore } from 'pl-fe/stores/modals';

import { ComposeForm } from '../../util/async-components';

import type { BaseModalProps } from '../modal-root';

const messages = defineMessages({
  confirm: { id: 'confirmations.cancel.confirm', defaultMessage: 'Discard' },
  cancelEditing: { id: 'confirmations.cancel_editing.confirm', defaultMessage: 'Cancel editing' },
  saveDraft: { id: 'confirmations.cancel_editing.save_draft', defaultMessage: 'Save draft' },
});

interface ComposeModalProps {
  composeId?: string;
}

const ComposeModal: React.FC<BaseModalProps & ComposeModalProps> = ({ onClose, composeId = 'compose-modal' }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const node = useRef<HTMLDivElement>(null);
  const compose = useCompose(composeId);
  const { openModal } = useModalsStore();

  const { id: statusId, privacy, in_reply_to: inReplyTo, quote, group_id: groupId } = compose!;

  const { isDragging, isDraggedOver } = useDraggedFiles(node, (files) => {
    dispatch(uploadCompose(composeId, files, intl));
  });

  const onClickClose = () => {
    if (checkComposeContent(compose)) {
      openModal('CONFIRM', {
        heading: statusId
          ? <FormattedMessage id='confirmations.cancel_editing.heading' defaultMessage='Cancel post editing' />
          : <FormattedMessage id='confirmations.cancel.heading' defaultMessage='Discard post' />,
        message: statusId
          ? <FormattedMessage id='confirmations.cancel_editing.message' defaultMessage='Are you sure you want to cancel editing this post? All changes will be lost.' />
          : <FormattedMessage id='confirmations.cancel.message' defaultMessage='Are you sure you want to cancel creating this post?' />,
        confirm: intl.formatMessage(statusId ? messages.cancelEditing : messages.confirm),
        onConfirm: () => {
          onClose('COMPOSE');
          dispatch(cancelReplyCompose());
        },
        secondary: intl.formatMessage(messages.saveDraft),
        onSecondary: statusId ? undefined : () => {
          dispatch(saveDraftStatus(composeId));
          onClose('COMPOSE');
          dispatch(cancelReplyCompose());
        },
      });
    } else {
      onClose('COMPOSE');
    }
  };

  const renderTitle = () => {
    if (statusId) {
      return <FormattedMessage id='navigation_bar.compose_edit' defaultMessage='Edit post' />;
    } else if (privacy === 'direct') {
      return <FormattedMessage id='navigation_bar.compose_direct' defaultMessage='Direct message' />;
    } else if (inReplyTo && groupId) {
      return <FormattedMessage id='navigation_bar.compose_group_reply' defaultMessage='Reply to group post' />;
    } else if (groupId) {
      return <FormattedMessage id='navigation_bar.compose_group' defaultMessage='Compose to group' />;
    } else if (inReplyTo) {
      return <FormattedMessage id='navigation_bar.compose_reply' defaultMessage='Reply to post' />;
    } else if (quote) {
      return <FormattedMessage id='navigation_bar.compose_quote' defaultMessage='Quote post' />;
    } else {
      return <FormattedMessage id='navigation_bar.compose' defaultMessage='Compose a post' />;
    }
  };

  return (
    <Modal
      ref={node}
      title={renderTitle()}
      onClose={onClickClose}
      className={clsx({
        'border-2 border-primary-600 border-dashed !z-[99]': isDragging,
        'ring-2 ring-offset-2 ring-primary-600': isDraggedOver,
      })}
    >
      <ComposeForm id={composeId} autoFocus />
    </Modal>
  );
};

export { type ComposeModalProps, ComposeModal as default };
