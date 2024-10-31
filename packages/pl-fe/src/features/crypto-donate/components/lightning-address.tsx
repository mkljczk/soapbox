import React from 'react';
import { FormattedMessage } from 'react-intl';

import CopyableInput from 'pl-fe/components/copyable-input';
import Emoji from 'pl-fe/components/ui/emoji';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';

interface ILightningAddress {
  address: string;
}

const LightningAddress: React.FC<ILightningAddress> = (props): JSX.Element => {
  const { address } = props;

  return (
    <Stack>
      <HStack alignItems='center' className='mb-1'>
        <Emoji
          className='mr-2.5 flex w-6 items-start justify-center rtl:ml-2.5 rtl:mr-0'
          emoji='⚡'
        />

        <Text weight='bold'>
          <FormattedMessage id='crypto.lightning' defaultMessage='Lightning' />
        </Text>
      </HStack>

      <CopyableInput value={address} />
    </Stack>
  );
};

export { LightningAddress as default };
