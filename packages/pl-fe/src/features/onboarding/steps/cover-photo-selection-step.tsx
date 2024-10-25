import clsx from 'clsx';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { patchMe } from 'pl-fe/actions/me';
import { BigCard } from 'pl-fe/components/big-card';
import StillImage from 'pl-fe/components/still-image';
import Avatar from 'pl-fe/components/ui/avatar';
import Button from 'pl-fe/components/ui/button';
import Icon from 'pl-fe/components/ui/icon';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import toast from 'pl-fe/toast';
import { isDefaultHeader } from 'pl-fe/utils/accounts';
import resizeImage from 'pl-fe/utils/resize-image';

import type { PlfeResponse } from 'pl-fe/api';

const messages = defineMessages({
  header: { id: 'account.header.alt', defaultMessage: 'Profile header' },
  error: { id: 'onboarding.error', defaultMessage: 'An unexpected error occurred. Please try again or skip this step.' },
});

const CoverPhotoSelectionStep = ({ onNext }: { onNext: () => void }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { account } = useOwnAccount();

  const fileInput = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<string | null>();
  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [isDisabled, setDisabled] = React.useState<boolean>(true);
  const isDefault = account ? isDefaultHeader(account.header) : false;

  const openFilePicker = () => {
    fileInput.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const maxPixels = 1920 * 1080;
    const rawFile = event.target.files?.item(0);

    if (!rawFile) return;

    resizeImage(rawFile, maxPixels).then((file) => {
      const url = file ? URL.createObjectURL(file) : account?.header as string;

      setSelectedFile(url);
      setSubmitting(true);

      const credentials = dispatch(patchMe({ header: file }));

      Promise.all([credentials]).then(() => {
        setDisabled(false);
        setSubmitting(false);
        onNext();
      }).catch((error: { response: PlfeResponse }) => {
        setSubmitting(false);
        setDisabled(false);
        setSelectedFile(null);

        if (error.response?.status === 422) {
          toast.error((error.response.json as any).error.replace('Validation failed: ', ''));
        } else {
          toast.error(messages.error);
        }
      });
    }).catch(console.error);
  };

  return (
    <BigCard
      title={<FormattedMessage id='onboarding.header.title' defaultMessage='Pick a cover image' />}
      subtitle={<FormattedMessage id='onboarding.header.subtitle' defaultMessage='This will be shown at the top of your profile.' />}
    >
      <Stack space={10}>
        <div className='rounded-lg border border-solid border-gray-200 dark:border-gray-800'>
          <div
            role='button'
            className='relative flex h-24 items-center justify-center rounded-t-md bg-gray-200 dark:bg-gray-800'
          >
            {selectedFile || account?.header && (
              <StillImage
                src={selectedFile || account.header}
                alt={account.header_description || intl.formatMessage(messages.header)}
                className='absolute inset-0 rounded-t-md object-cover'
              />
            )}

            {isSubmitting && (
              <div
                className='absolute inset-0 flex items-center justify-center rounded-t-md bg-white/80 dark:bg-primary-900/80'
              >
                <Spinner withText={false} />
              </div>
            )}

            <button
              onClick={openFilePicker}
              type='button'
              className={clsx({
                'absolute -top-3 -right-3 p-1 bg-primary-600 rounded-full ring-2 ring-white dark:ring-primary-900 hover:bg-primary-700': true,
                'opacity-50 pointer-events-none': isSubmitting,
              })}
              disabled={isSubmitting}
            >
              <Icon src={require('@tabler/icons/outline/plus.svg')} className='size-5 text-white' />
            </button>

            <input type='file' className='hidden' ref={fileInput} onChange={handleFileChange} />
          </div>

          <div className='flex flex-col px-4 pb-4'>
            {account && (
              <Avatar
                src={account.avatar}
                alt={account.avatar_description}
                size={64}
                className='-mt-8 mb-2 ring-2 ring-white dark:ring-primary-800'
              />
            )}

            <Text weight='bold' size='sm'>{account?.display_name}</Text>
            <Text theme='muted' size='sm'>@{account?.username}</Text>
          </div>
        </div>

        <Stack justifyContent='center' space={2}>
          <Button block theme='primary' type='button' onClick={onNext} disabled={isDefault && isDisabled || isSubmitting}>
            {isSubmitting ? (
              <FormattedMessage id='onboarding.saving' defaultMessage='Saving…' />
            ) : (
              <FormattedMessage id='onboarding.next' defaultMessage='Next' />
            )}
          </Button>

          {isDisabled && (
            <Button block theme='tertiary' type='button' onClick={onNext}>
              <FormattedMessage id='onboarding.skip' defaultMessage='Skip for now' />
            </Button>
          )}
        </Stack>
      </Stack>
    </BigCard>
  );
};

export { CoverPhotoSelectionStep as default };
