import clsx from 'clsx';
import React, { useRef } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import AltIndicator from 'pl-fe/components/alt-indicator';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import IconButton from 'pl-fe/components/ui/icon-button';
import Text from 'pl-fe/components/ui/text';
import { useDraggedFiles } from 'pl-fe/hooks/use-dragged-files';
import { useModalsStore } from 'pl-fe/stores/modals';

const messages = defineMessages({
  title: { id: 'group.upload_banner.title', defaultMessage: 'Upload background picture' },
  changeHeaderDescriptionHeading: { id: 'group.upload_banner.alt.heading', defaultMessage: 'Change header description' },
  changeHeaderDescriptionPlaceholder: { id: 'group.upload_banner.alt.placeholder', defaultMessage: 'Image description' },
  changeHeaderDescriptionConfirm: { id: 'group.upload_banner.alt.confirm', defaultMessage: 'Save' },
});

interface IMediaInput {
  src: string | undefined;
  accept?: string;
  onChange: (files: FileList | null) => void;
  onClear?: () => void;
  disabled?: boolean;
  description?: string;
  onChangeDescription?: (value: string) => void;
}

const HeaderPicker = React.forwardRef<HTMLInputElement, IMediaInput>(({
  src, onChange, onClear, accept, disabled, description, onChangeDescription,
}, ref) => {
  const { openModal } = useModalsStore();
  const intl = useIntl();

  const picker = useRef<HTMLLabelElement>(null);

  const { isDragging, isDraggedOver } = useDraggedFiles(picker, (files) => {
    onChange(files);
  });

  const handleClear: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    onClear!();
  };

  const handleChangeDescriptionClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    openModal('TEXT_FIELD', {
      heading: intl.formatMessage(messages.changeHeaderDescriptionHeading),
      placeholder: intl.formatMessage(messages.changeHeaderDescriptionPlaceholder),
      confirm: intl.formatMessage(messages.changeHeaderDescriptionConfirm),
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
        'dark:sm:shadow-inset relative h-24 w-full cursor-pointer overflow-hidden rounded-lg bg-primary-100 text-primary-500 dark:bg-gray-800 dark:text-accent-blue sm:h-36 sm:shadow',
        {
          'border-2 border-primary-600 border-dashed !z-[99]': isDragging,
          'ring-2 ring-offset-2 ring-primary-600': isDraggedOver,
        },
      )}
      title={intl.formatMessage(messages.title)}
      tabIndex={0}
    >
      {src && <img className='size-full object-cover' src={src} alt='' />}
      <HStack
        className={clsx('absolute top-0 size-full transition-opacity', {
          'opacity-0 hover:opacity-90 bg-primary-100 dark:bg-gray-800': src,
        })}
        space={1.5}
        alignItems='center'
        justifyContent='center'
      >
        <Icon
          src={require('@fluentui/image_add_24_regular.svg')}
          className='size-4.5'
        />

        <Text size='md' theme='primary' weight='semibold'>
          <FormattedMessage id='group.upload_banner' defaultMessage='Upload photo' />
        </Text>

        <input
          ref={ref}
          name='header'
          type='file'
          accept={accept}
          onChange={({ target }) => onChange(target.files)}
          disabled={disabled}
          className='hidden'
        />
      </HStack>
      {onClear && src && (
        <IconButton
          onClick={handleClear}
          src={require('@fluentui/dismiss_24_regular.svg')}
          theme='dark'
          className='absolute right-2 top-2 z-10 hover:scale-105 hover:bg-gray-900'
          iconClassName='h-5 w-5'
        />
      )}
      {onChangeDescription && src && (
        <button type='button' className='absolute left-2 top-2' onClick={handleChangeDescriptionClick}>
          <AltIndicator warning={!description} />
        </button>
      )}
    </label>
  );
});

export { HeaderPicker as default };
