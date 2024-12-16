import React, { useRef } from 'react';
import { defineMessages, FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Account from 'pl-fe/components/account';
import StatusContent from 'pl-fe/components/status-content';
import StatusLanguagePicker from 'pl-fe/components/status-language-picker';
import StatusReactionsBar from 'pl-fe/components/status-reactions-bar';
import StatusReplyMentions from 'pl-fe/components/status-reply-mentions';
import StatusInfo from 'pl-fe/components/statuses/status-info';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Emojify from 'pl-fe/features/emoji/emojify';

import StatusInteractionBar from './status-interaction-bar';
import StatusTypeIcon from './status-type-icon';

import type { Status as NormalizedStatus } from 'pl-fe/normalizers/status';

const messages = defineMessages({
  applicationName: { id: 'status.application_name', defaultMessage: 'Sent from {name}' },
});

interface IDetailedStatus {
  status: NormalizedStatus;
  withMedia?: boolean;
  onOpenCompareHistoryModal: (status: Pick<NormalizedStatus, 'id'>) => void;
}

const DetailedStatus: React.FC<IDetailedStatus> = ({
  status,
  onOpenCompareHistoryModal,
  withMedia = true,
}) => {
  const intl = useIntl();

  const node = useRef<HTMLDivElement>(null);

  const handleOpenCompareHistoryModal = () => {
    onOpenCompareHistoryModal(status);
  };

  const renderStatusInfo = () => {
    if (status.group_id) {
      return (
        <div className='mb-4'>
          <StatusInfo
            avatarSize={42}
            icon={
              <Icon
                src={require('@tabler/icons/outline/circles.svg')}
                className='size-4 text-primary-600 dark:text-accent-blue'
              />
            }
            text={
              <FormattedMessage
                id='status.group'
                defaultMessage='Posted in {group}'
                values={{
                  group: (
                    <Link to={`/groups/${status.group_id}`} className='hover:underline'>
                      <bdi className='truncate'>
                        <strong className='text-gray-800 dark:text-gray-200'>
                          <Emojify text={status.account.display_name} emojis={status.account.emojis} />
                        </strong>
                      </bdi>
                    </Link>
                  ),
                }}
              />
            }
          />
        </div>
      );
    }
  };

  const { account } = status;
  if (!account || typeof account !== 'object') return null;

  return (
    <div className='border-box'>
      <div ref={node} className='detailed-status' tabIndex={-1}>
        {renderStatusInfo()}

        <div className='mb-4'>
          <Account
            key={account.id}
            account={account}
            avatarSize={42}
            hideActions
            approvalStatus={status.approval_status}
          />
        </div>

        <StatusReplyMentions status={status} />

        <Stack className='relative z-0'>
          <Stack space={4}>
            <StatusContent
              status={status}
              textSize='lg'
              translatable
              withMedia
            />
          </Stack>
        </Stack>

        <StatusReactionsBar status={status} />

        <HStack justifyContent='between' alignItems='center' className='py-3' wrap>
          <StatusInteractionBar status={status} />

          <HStack space={1} alignItems='center'>
            <span>
              <Text tag='span' theme='muted' size='sm'>
                <a href={status.url} target='_blank' rel='noopener' className='hover:underline'>
                  <FormattedDate value={new Date(status.created_at)} hour12 year='numeric' month='short' day='2-digit' hour='numeric' minute='2-digit' />
                </a>

                {status.application && (
                  <>
                    {' · '}
                    <a
                      href={(status.application.website) ? status.application.website : '#'}
                      target='_blank'
                      rel='noopener'
                      className='hover:underline'
                      title={intl.formatMessage(messages.applicationName, { name: status.application.name })}
                    >
                      {status.application.name}
                    </a>
                  </>
                )}

                {status.edited_at && (
                  <>
                    {' · '}
                    <div
                      className='inline hover:underline'
                      onClick={handleOpenCompareHistoryModal}
                      role='button'
                      tabIndex={0}
                    >
                      <FormattedMessage id='status.edited' defaultMessage='Edited {date}' values={{ date: intl.formatDate(new Date(status.edited_at), { hour12: true, month: 'short', day: '2-digit', hour: 'numeric', minute: '2-digit' }) }} />
                    </div>
                  </>
                )}
              </Text>
            </span>

            <StatusTypeIcon status={status} />

            <StatusLanguagePicker status={status} showLabel />
          </HStack>
        </HStack>
      </div>
    </div>
  );
};

export { DetailedStatus as default };
