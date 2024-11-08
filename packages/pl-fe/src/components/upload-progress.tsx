import React from 'react';
import { FormattedMessage } from 'react-intl';

import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import ProgressBar from 'pl-fe/components/ui/progress-bar';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';

interface IUploadProgress {
  /** Number between 0 and 100 to represent the percentage complete. */
  progress: number;
}

/** Displays a progress bar for uploading files. */
const UploadProgress: React.FC<IUploadProgress> = ({ progress }) => (
  <HStack alignItems='center' space={2}>
    <Icon
      src={require('@tabler/icons/outline/cloud-upload.svg')}
      className='size-7 text-gray-500'
    />

    <Stack space={1}>
      <Text theme='muted'>
        <FormattedMessage id='upload_progress.label' defaultMessage='Uploading…' />
      </Text>

      <ProgressBar progress={progress / 100} size='sm' />
    </Stack>
  </HStack>
);

export { UploadProgress as default };
