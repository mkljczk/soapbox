import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { muteAccount } from 'pl-fe/actions/accounts';
import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import HStack from 'pl-fe/components/ui/hstack';
import Modal from 'pl-fe/components/ui/modal';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Toggle from 'pl-fe/components/ui/toggle';
import DurationSelector from 'pl-fe/features/compose/components/polls/duration-selector';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useFeatures } from 'pl-fe/hooks/use-features';

import type { BaseModalProps } from '../modal-root';

interface MuteModalProps {
  accountId: string;
}

const MuteModal: React.FC<MuteModalProps & BaseModalProps> = ({ accountId, onClose }) => {
  const dispatch = useAppDispatch();

  const { account } = useAccount(accountId || undefined);
  const [notifications, setNotifications] = useState(true);
  const [duration, setDuration] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mutesDuration = useFeatures().mutesDuration;

  if (!account) return null;

  const handleClick = () => {
    setIsSubmitting(true);
    dispatch(muteAccount(account.id, notifications, duration))?.then(() => {
      setIsSubmitting(false);
      onClose('MUTE');
    });
  };

  const handleCancel = () => {
    onClose('MUTE');
  };

  const toggleNotifications = () => {
    setNotifications(notifications => !notifications);
  };

  const handleChangeMuteDuration = (expiresIn: number): void => {
    setDuration(expiresIn);
  };

  const toggleAutoExpire = () => setDuration(duration ? 0 : 2 * 60 * 60 * 24);

  return (
    <Modal
      title={
        <FormattedMessage
          id='confirmations.mute.heading'
          defaultMessage='Mute @{name}'
          values={{ name: account.acct }}
        />
      }
      onClose={handleCancel}
      confirmationAction={handleClick}
      confirmationText={<FormattedMessage id='confirmations.mute.confirm' defaultMessage='Mute' />}
      confirmationDisabled={isSubmitting}
      cancelText={<FormattedMessage id='confirmation_modal.cancel' defaultMessage='Cancel' />}
      cancelAction={handleCancel}
    >
      <Stack space={4}>
        <Text>
          <FormattedMessage
            id='confirmations.mute.message'
            defaultMessage='Are you sure you want to mute {name}?'
            values={{ name: <strong className='break-words'>@{account.acct}</strong> }}
          />
        </Text>

        <label>
          <HStack alignItems='center' space={2}>
            <Text tag='span' theme='muted'>
              <FormattedMessage id='mute_modal.hide_notifications' defaultMessage='Hide notifications from this user?' />
            </Text>

            <Toggle
              checked={notifications}
              onChange={toggleNotifications}
            />
          </HStack>
        </label>

        {mutesDuration && (
          <>
            <label>
              <HStack alignItems='center' space={2}>
                <Text tag='span'>
                  <FormattedMessage id='mute_modal.auto_expire' defaultMessage='Automatically expire mute?' />
                </Text>

                <Toggle
                  checked={duration !== 0}
                  onChange={toggleAutoExpire}
                />
              </HStack>
            </label>

            {duration !== 0 && (
              <Stack space={2}>
                <Text weight='medium'><FormattedMessage id='mute_modal.duration' defaultMessage='Duration' />: </Text>

                <DurationSelector onDurationChange={handleChangeMuteDuration} />
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Modal>
  );
};

export { MuteModal as default, type MuteModalProps };
