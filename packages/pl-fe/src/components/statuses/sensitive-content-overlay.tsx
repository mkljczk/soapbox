import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Button from 'pl-fe/components/ui/button';
import HStack from 'pl-fe/components/ui/hstack';
import Text from 'pl-fe/components/ui/text';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { useStatusMetaStore } from 'pl-fe/stores/status-meta';

import type { Status } from 'pl-fe/normalizers/status';

const useMediaVisible = (status: Pick<Status, 'media_attachments' | 'sensitive'> & { id?: string }, displayMedia: 'default' | 'show_all' | 'hide_all') => {
  let visible = !status.sensitive;

  const statusesMeta = useStatusMetaStore().statuses;
  const mediaVisible = status.id ? statusesMeta[status.id]?.mediaVisible : undefined;

  if (mediaVisible !== undefined) visible = mediaVisible;
  else if (displayMedia === 'show_all') visible = true;
  else if (displayMedia === 'hide_all' && status.media_attachments.length) visible = false;

  return visible;
};

const useShowOverlay = (status: Pick<Status, 'id' | 'media_attachments' | 'sensitive'>, displayMedia: 'default' | 'show_all' | 'hide_all') => {
  const visible = useMediaVisible(status, displayMedia);

  const showHideButton = status.sensitive || (status.media_attachments.length && displayMedia === 'hide_all');

  return !visible || showHideButton;
};

const messages = defineMessages({
  delete: { id: 'status.delete', defaultMessage: 'Delete' },
  deleteConfirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
  deleteHeading: { id: 'confirmations.delete.heading', defaultMessage: 'Delete post' },
  deleteMessage: { id: 'confirmations.delete.message', defaultMessage: 'Are you sure you want to delete this post?' },
  hide: { id: 'moderation_overlay.hide', defaultMessage: 'Hide content' },
  sensitiveTitle: { id: 'status.sensitive_warning', defaultMessage: 'Sensitive content' },
  sensitiveSubtitle: { id: 'status.sensitive_warning.subtitle', defaultMessage: 'This content may not be suitable for all audiences.' },
  show: { id: 'moderation_overlay.show', defaultMessage: 'Show content' },
});

interface ISensitiveContentOverlay {
  status: Pick<Status, 'id' | 'sensitive' | 'media_attachments'>;
}

const SensitiveContentOverlay = React.forwardRef<HTMLDivElement, ISensitiveContentOverlay>((props, ref) => {
  const { status } = props;

  const intl = useIntl();
  const { displayMedia } = useSettings();

  const visible = useMediaVisible(status, displayMedia);

  const { hideStatusMedia, revealStatusMedia } = useStatusMetaStore();

  const toggleVisibility = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (visible) hideStatusMedia(status.id);
    else revealStatusMedia(status.id);
  };

  if (!useShowOverlay(status, displayMedia)) return null;

  return (
    <div
      className={clsx('absolute z-40', {
        'cursor-default backdrop-blur-lg rounded-lg w-full h-full border-0 flex justify-center': !visible,
        'bg-gray-800/75 inset-0': !visible,
        'bottom-1 right-1': visible,
      })}
      data-testid='sensitive-overlay'
    >
      {visible ? (
        <Button
          text={intl.formatMessage(messages.hide)}
          icon={require('@tabler/icons/outline/eye-off.svg')}
          onClick={toggleVisibility}
          theme='primary'
          size='sm'
        />
      ) : (
        <div className='flex max-h-screen items-center justify-center'>
          <div className='mx-auto space-y-4 text-center' ref={ref}>
            <div className='space-y-1'>
              <Text theme='white' weight='semibold'>
                {intl.formatMessage(messages.sensitiveTitle)}
              </Text>

              <Text theme='white' size='sm' weight='medium'>
                {intl.formatMessage(messages.sensitiveSubtitle)}
              </Text>
            </div>

            <HStack alignItems='center' justifyContent='center' space={2}>
              <Button
                type='button'
                theme='outline'
                size='sm'
                icon={require('@tabler/icons/outline/eye.svg')}
                onClick={toggleVisibility}
              >
                {intl.formatMessage(messages.show)}
              </Button>
            </HStack>
          </div>
        </div>
      )}
    </div>
  );
});

export { SensitiveContentOverlay as default, useMediaVisible };
