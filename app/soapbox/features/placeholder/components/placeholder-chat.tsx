import React from 'react';

import { HStack, Stack } from 'soapbox/components/ui';

import PlaceholderAvatar from './placeholder_avatar';
import PlaceholderDisplayName from './placeholder_display_name';

/** Fake chat to display while data is loading. */
const PlaceholderChat = () => {
  return (
    <div className='px-4 py-2 w-full flex flex-col animate-pulse'>
      <HStack alignItems='center' space={2}>
        <PlaceholderAvatar size={40} />

        <Stack alignItems='start'>
          <PlaceholderDisplayName minLength={3} maxLength={15} />
        </Stack>
      </HStack>
    </div>
  );
};

export default PlaceholderChat;
