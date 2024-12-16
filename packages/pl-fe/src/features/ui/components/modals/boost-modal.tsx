import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Icon from 'pl-fe/components/icon';
import Modal from 'pl-fe/components/ui/modal';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import ReplyIndicator from 'pl-fe/features/compose/components/reply-indicator';
import { statusQueryOptions } from 'pl-fe/queries/statuses/status';

import type { BaseModalProps } from '../modal-root';
import type { Status as StatusEntity } from 'pl-fe/normalizers/status';

const messages = defineMessages({
  cancel_reblog: { id: 'status.cancel_reblog_private', defaultMessage: 'Un-repost' },
  reblog: { id: 'status.reblog', defaultMessage: 'Repost' },
});

interface BoostModalProps {
  statusId: string;
  onReblog: (status: Pick<StatusEntity, 'id' | 'reblogged'>) => void;
}

const BoostModal: React.FC<BaseModalProps & BoostModalProps> = ({ statusId, onReblog, onClose }) => {
  const intl = useIntl();
  const { data: status } = useQuery(statusQueryOptions(statusId));

  if (!status) return null;

  const handleReblog = () => {
    onReblog(status);
    onClose('BOOST');
  };

  const buttonText = status.reblogged ? messages.cancel_reblog : messages.reblog;

  return (
    <Modal
      title={<FormattedMessage id='boost_modal.title' defaultMessage='Repost?' />}
      confirmationAction={handleReblog}
      confirmationText={intl.formatMessage(buttonText)}
    >
      <Stack space={4}>
        <ReplyIndicator status={status} hideActions />

        <Text>
          <FormattedMessage id='boost_modal.combo' defaultMessage='You can press {combo} to skip this next time' values={{ combo: <span>Shift + <Icon className='inline-block align-middle' src={require('@tabler/icons/outline/repeat.svg')} /></span> }} />
        </Text>
      </Stack>
    </Modal>
  );
};

export { type BoostModalProps, BoostModal as default };
