import clsx from 'clsx';
import React, { useRef } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AltIndicator from 'pl-fe/components/alt-indicator';
import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import { useDraggedFiles } from 'pl-fe/hooks/use-dragged-files';
import { useModalsStore } from 'pl-fe/stores/modals';

const messages = defineMessages({
  changeDescriptionHeading: { id: 'group.upload_avatar.alt.heading', defaultMessage: 'Change avatar description' },
  changeDescriptionPlaceholder: { id: 'group.upload_avatar.alt.placeholder', defaultMessage: 'Image description' },
  changeDescriptionConfirm: { id: 'group.upload_avatar.alt.confirm', defaultMessage: 'Save' },
});

interface IMediaInput {
  className?: string;
  src: string | undefined;
  accept?: string;
  onChange: (files: FileList | null) => void;
  disabled?: boolean;
  description?: string;
  onChangeDescription?: (value: string) => void;
}

const AvatarPicker = React.forwardRef<HTMLInputElement, IMediaInput>(({
  className, src, onChange, accept, disabled, description, onChangeDescription,
}, ref) => {
  const { openModal } = useModalsStore();
  const intl = useIntl();

  const picker = useRef<HTMLLabelElement>(null);

  const { isDragging, isDraggedOver } = useDraggedFiles(picker, (files) => {
    onChange(files);
  });

  const handleChangeDescriptionClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    openModal('TEXT_FIELD', {
      heading: intl.formatMessage(messages.changeDescriptionHeading),
      placeholder: intl.formatMessage(messages.changeDescriptionPlaceholder),
      confirm: intl.formatMessage(messages.changeDescriptionConfirm),
      onConfirm: (description?: string) => {
        onChangeDescription?.(description || '');
      },
      text: description,
    });
  };

  return (
    <label
      ref={picker}
      className={clsx(
        'absolute bottom-0 left-1/2 size-20 -translate-x-1/2 translate-y-1/2 cursor-pointer bg-primary-300 ring-2',
        {
          'rounded-lg': onChangeDescription,
          'rounded-full': !onChangeDescription,
          'border-2 border-primary-600 border-dashed !z-[99] overflow-hidden': isDragging,
          'ring-white dark:ring-primary-900': !isDraggedOver,
          'ring-offset-2 ring-primary-600': isDraggedOver,
        },
        className,
      )}
      style={{ height: 80, width: 80 }}
    >
      {src && <Avatar className={clsx(onChangeDescription && '!rounded-lg')} src={src} size={80} />}
      <HStack
        alignItems='center'
        justifyContent='center'
        className={clsx('absolute left-0 top-0 size-full transition-opacity', {
          'rounded-lg': onChangeDescription,
          'rounded-full': !onChangeDescription,
          'opacity-0 hover:opacity-90 bg-primary-500': src,
        })}
      >
        <Icon
          src={require('@fluentui/camera_add_24_regular.svg')}
          className='size-5 text-white'
        />
      </HStack>
      <span className='sr-only'><FormattedMessage id='group.upload_avatar' defaultMessage='Upload avatar' /></span>
      <input
        ref={ref}
        name='avatar'
        type='file'
        accept={accept}
        onChange={({ target }) => onChange(target.files)}
        disabled={disabled}
        className='hidden'
      />
      {onChangeDescription && src && (
        <button type='button' className='absolute left-1 top-1' onClick={handleChangeDescriptionClick}>
          <AltIndicator warning={!description} />
        </button>
      )}
    </label>
  );
});

export { AvatarPicker as default };
