import clsx from 'clsx';
import React, { useMemo, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Text from 'pl-fe/components/ui/text';

import type { Scrobble as ScrobbleEntity } from 'pl-api';

interface IScrobble {
  scrobble: ScrobbleEntity;
}

const Scrobble: React.FC<IScrobble> = ({ scrobble }) => {
  const textRef = useRef<HTMLParagraphElement>(null);

  const isRecent = (new Date().getTime() - new Date(scrobble.created_at).getTime()) <= 60 * 60 * 1000;

  const song = scrobble.artist ? (
    <FormattedMessage
      id='account.scrobbling.title' defaultMessage='{title} by {artist}' values={{
        title: scrobble.title,
        artist: scrobble.artist,
      }}
    />
  ) : scrobble.title;

  const animate = useMemo(
    () => textRef.current && textRef.current.parentElement && textRef.current.clientWidth > textRef.current.parentElement.clientWidth,
    [textRef.current],
  );

  if (!isRecent) return null;

  return (
    <HStack alignItems='center' space={0.5}>
      <Icon
        src={require('@fluentui/headphones_sound_wave_24_regular.svg')}
        className='size-4 text-gray-800 dark:text-gray-200'
      />

      <div className='relative box-border w-full overflow-hidden whitespace-nowrap'>
        <Text
          size='sm'
          className={clsx('relative inline-block', {
            'animate-text-overflow': animate,
          })}
          ref={textRef}
        >
          <FormattedMessage
            id='account.scrobbling' defaultMessage='Playing {song}' values={{
              song: scrobble.external_link ? (
                <a
                  href={scrobble.external_link}
                  className='underline'
                  onClick={(e) => e.stopPropagation()}
                  rel='nofollow noopener'
                  target='_blank'
                >
                  {song}
                </a>
              ) : song,
            }}
          />
        </Text>
      </div>
    </HStack>
  );
};

export { Scrobble as default };
