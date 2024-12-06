import React from 'react';

import HStack from 'pl-fe/components/ui/hstack';

import PlaceholderAvatar from './placeholder-avatar';
import PlaceholderDisplayName from './placeholder-display-name';

/** Fake account to display while data is loading. */
const PlaceholderAccount: React.FC = React.memo(() => (
  <HStack space={3} alignItems='center'>
    <div className='shrink-0'>
      <PlaceholderAvatar size={42} />
    </div>

    <div className='min-w-0 flex-1'>
      <PlaceholderDisplayName minLength={3} maxLength={25} />
    </div>
  </HStack>
));

export { PlaceholderAccount as default };
