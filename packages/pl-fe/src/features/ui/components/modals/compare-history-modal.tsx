import React, { useEffect } from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';

import { fetchHistory } from 'pl-fe/actions/history';
import AttachmentThumbs from 'pl-fe/components/attachment-thumbs';
import { ParsedContent } from 'pl-fe/components/parsed-content';
import HStack from 'pl-fe/components/ui/hstack';
import Modal from 'pl-fe/components/ui/modal';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Emojify from 'pl-fe/features/emoji/emojify';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

import type { BaseModalProps } from '../modal-root';

interface CompareHistoryModalProps {
  statusId: string;
}

const CompareHistoryModal: React.FC<BaseModalProps & CompareHistoryModalProps> = ({ onClose, statusId }) => {
  const dispatch = useAppDispatch();

  const loading = useAppSelector(state => state.history.getIn([statusId, 'loading']));
  const versions = useAppSelector(state => state.history.get(statusId)?.items);

  const status = useAppSelector(state => state.statuses.get(statusId));

  const onClickClose = () => {
    onClose('COMPARE_HISTORY');
  };

  useEffect(() => {
    dispatch(fetchHistory(statusId));
  }, [statusId]);

  let body;

  if (loading) {
    body = <Spinner />;
  } else {
    body = (
      <div className='divide-y divide-solid divide-gray-200 dark:divide-gray-800'>
        {versions?.map((version) => {
          const content = <ParsedContent html={version.content} mentions={status?.mentions} hasQuote={!!status?.quote_id} emojis={version.emojis} />;

          const poll = typeof version.poll !== 'string' && version.poll;

          return (
            <div className='flex flex-col py-2 first:pt-0 last:pb-0'>
              {version.spoiler_text?.length > 0 && (
                <>
                  <span>
                    <Emojify text={version.spoiler_text} emojis={version.emojis} />
                  </span>
                  <hr />
                </>
              )}

              <div className='status__content'>
                {content}
              </div>

              {poll && (
                <div className='poll'>
                  <Stack>
                    {poll.options.map((option: any) => (
                      <HStack alignItems='center' className='p-1 text-gray-900 dark:text-gray-300'>
                        <span
                          className='mr-2.5 inline-block size-4 flex-none rounded-full border border-solid border-primary-600'
                          tabIndex={0}
                          role='radio'
                        />

                        <span>
                          <ParsedContent html={option.title} emojis={version.emojis} />
                        </span>
                      </HStack>
                    ))}
                  </Stack>
                </div>
              )}

              {version.media_attachments.length > 0 && (
                <AttachmentThumbs status={version} />
              )}

              <Text align='right' tag='span' theme='muted' size='sm'>
                <FormattedDate value={new Date(version.created_at)} hour12 year='numeric' month='short' day='2-digit' hour='numeric' minute='2-digit' />
              </Text>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='compare_history_modal.header' defaultMessage='Edit history' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { type CompareHistoryModalProps, CompareHistoryModal as default };
