import React from 'react';

import Button from 'pl-fe/components/ui/button';
import HStack from 'pl-fe/components/ui/hstack';
import { useSettings } from 'pl-fe/hooks/use-settings';

interface IPinnedHostsPicker {
  /** The active host among pinned hosts. */
  host?: string;
}

const PinnedHostsPicker: React.FC<IPinnedHostsPicker> = ({ host: activeHost }) => {
  const settings = useSettings();
  const pinnedHosts = settings.remote_timeline.pinnedHosts;

  if (!pinnedHosts.length) return null;

  return (
    <HStack className='mb-4 black:mx-2' space={2}>
      {pinnedHosts.map((host) => (
        <Button
          key={host}
          to={`/timeline/${host}`}
          size='sm'
          theme={host === activeHost ? 'accent' : 'secondary'}
        >
          {host}
        </Button>
      ))}
    </HStack>
  );
};

export { PinnedHostsPicker as default };
