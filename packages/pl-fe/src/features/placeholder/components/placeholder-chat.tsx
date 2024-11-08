import React from 'react';

import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';

import PlaceholderAvatar from './placeholder-avatar';
import PlaceholderDisplayName from './placeholder-display-name';

/** Fake chat to display while data is loading. */
const PlaceholderChat = () => (
  <div className='flex w-full animate-pulse flex-col px-4 py-2'>
    <HStack alignItems='center' space={2}>
      <PlaceholderAvatar size={40} />

      <Stack alignItems='start'>
        <PlaceholderDisplayName minLength={3} maxLength={15} />
      </Stack>
    </HStack>
  </div>
);

export { PlaceholderChat as default };
