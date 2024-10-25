import clsx from 'clsx';
import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import { patchMe } from 'pl-fe/actions/me';
import { BigCard } from 'pl-fe/components/big-card';
import Avatar from 'pl-fe/components/ui/avatar';
import Button from 'pl-fe/components/ui/button';
import Icon from 'pl-fe/components/ui/icon';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import toast from 'pl-fe/toast';
import { isDefaultAvatar } from 'pl-fe/utils/accounts';
import resizeImage from 'pl-fe/utils/resize-image';

import type { PlfeResponse } from 'pl-fe/api';

const messages = defineMessages({
  error: { id: 'onboarding.error', defaultMessage: 'An unexpected error occurred. Please try again or skip this step.' },
});

const AvatarSelectionStep = ({ onNext }: { onNext: () => void }) => {
  const dispatch = useAppDispatch();
  const { account } = useOwnAccount();

  const fileInput = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<string | null>();
  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [isDisabled, setDisabled] = React.useState<boolean>(true);
  const isDefault = account ? isDefaultAvatar(account.avatar) : false;

  const openFilePicker = () => {
    fileInput.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const maxPixels = 400 * 400;
    const rawFile = event.target.files?.item(0);

    if (!rawFile) return;

    resizeImage(rawFile, maxPixels).then((file) => {
      const url = file ? URL.createObjectURL(file) : account?.avatar as string;

      setSelectedFile(url);
      setSubmitting(true);

      const credentials = dispatch(patchMe({ avatar: rawFile }));

      return Promise.all([credentials]).then(() => {
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
      title={<FormattedMessage id='onboarding.avatar.title' defaultMessage='Choose a profile picture' />}
      subtitle={<FormattedMessage id='onboarding.avatar.subtitle' defaultMessage='Just have fun with it.' />}
    >
      <Stack space={10}>
        <div className='relative mx-auto rounded-full bg-gray-200'>
          {account && (
            <Avatar src={selectedFile || account.avatar} alt={account.avatar_description} size={175} />
          )}

          {isSubmitting && (
            <div className='absolute inset-0 flex items-center justify-center rounded-full bg-white/80 dark:bg-primary-900/80'>
              <Spinner withText={false} />
            </div>
          )}

          <button
            onClick={openFilePicker}
            type='button'
            className={clsx({
              'absolute bottom-3 right-2 p-1 bg-primary-600 rounded-full ring-2 ring-white dark:ring-primary-900 hover:bg-primary-700': true,
              'opacity-50 pointer-events-none': isSubmitting,
            })}
            disabled={isSubmitting}
          >
            <Icon src={require('@tabler/icons/outline/plus.svg')} className='size-5 text-white' />
          </button>

          <input type='file' className='hidden' ref={fileInput} onChange={handleFileChange} />
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

export { AvatarSelectionStep as default };
