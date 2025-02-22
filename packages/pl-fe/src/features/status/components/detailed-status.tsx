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

import type { SelectedStatus } from 'pl-fe/selectors';

const messages = defineMessages({
  applicationName: { id: 'status.application_name', defaultMessage: 'Sent from {name}' },
});

interface IDetailedStatus {
  status: SelectedStatus;
  onOpenCompareHistoryModal: (status: Pick<SelectedStatus, 'id'>) => void;
}

const DetailedStatus: React.FC<IDetailedStatus> = ({
  status,
  onOpenCompareHistoryModal,
}) => {
  const intl = useIntl();

  const node = useRef<HTMLDivElement>(null);

  const handleOpenCompareHistoryModal = () => {
    onOpenCompareHistoryModal(status);
  };

  const renderStatusInfo = () => {
    if (status.group) {
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
                    <Link to={`/groups/${status.group.id}`} className='hover:underline'>
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

  const actualStatus = status?.reblog || status;
  if (!actualStatus) return null;
  const { account } = actualStatus;
  if (!account || typeof account !== 'object') return null;

  return (
    <div className='border-box'>
      <div ref={node} className='detailed-actualStatus' tabIndex={-1}>
        {renderStatusInfo()}

        <div className='mb-4'>
          <Account
            key={account.id}
            account={account}
            avatarSize={42}
            hideActions
            approvalStatus={actualStatus.approval_status}
          />
        </div>

        <StatusReplyMentions status={actualStatus} />

        <Stack className='relative z-0'>
          <Stack space={4}>
            <StatusContent
              status={actualStatus}
              textSize='lg'
              translatable
              withMedia
            />
          </Stack>
        </Stack>

        <StatusReactionsBar status={actualStatus} />

        <HStack justifyContent='between' alignItems='center' className='py-3' wrap>
          <StatusInteractionBar status={actualStatus} />

          <HStack space={1} alignItems='center'>
            <span>
              <Text tag='span' theme='muted' size='sm'>
                <a href={actualStatus.url} target='_blank' rel='noopener' className='hover:underline'>
                  <FormattedDate value={new Date(actualStatus.created_at)} hour12 year='numeric' month='short' day='2-digit' hour='numeric' minute='2-digit' />
                </a>

                {actualStatus.application && (
                  <>
                    {' · '}
                    <a
                      href={(actualStatus.application.website) ? actualStatus.application.website : '#'}
                      target='_blank'
                      rel='noopener'
                      className='hover:underline'
                      title={intl.formatMessage(messages.applicationName, { name: actualStatus.application.name })}
                    >
                      {actualStatus.application.name}
                    </a>
                  </>
                )}

                {actualStatus.edited_at && (
                  <>
                    {' · '}
                    <div
                      className='inline hover:underline'
                      onClick={handleOpenCompareHistoryModal}
                      role='button'
                      tabIndex={0}
                    >
                      <FormattedMessage id='status.edited' defaultMessage='Edited {date}' values={{ date: intl.formatDate(new Date(actualStatus.edited_at), { hour12: true, month: 'short', day: '2-digit', hour: 'numeric', minute: '2-digit' }) }} />
                    </div>
                  </>
                )}
              </Text>
            </span>

            <StatusTypeIcon visibility={actualStatus.visibility} />

            <StatusLanguagePicker status={actualStatus} showLabel />
          </HStack>
        </HStack>
      </div>
    </div>
  );
};

export { DetailedStatus as default };
