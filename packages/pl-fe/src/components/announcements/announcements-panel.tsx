import clsx from 'clsx';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ReactSwipeableViews from 'react-swipeable-views';
import { createSelector } from 'reselect';

import Card from 'pl-fe/components/ui/card';
import HStack from 'pl-fe/components/ui/hstack';
import Widget from 'pl-fe/components/ui/widget';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useAnnouncements } from 'pl-fe/queries/announcements/use-announcements';

import Announcement from './announcement';

import type { CustomEmoji } from 'pl-api';
import type { RootState } from 'pl-fe/store';

const customEmojiMap = createSelector([(state: RootState) => state.custom_emojis], items => items.reduce<Record<string, CustomEmoji>>((map, emoji) => (map[emoji.shortcode] = emoji, map), {}));

const AnnouncementsPanel = () => {
  const emojiMap = useAppSelector(state => customEmojiMap(state));
  const [index, setIndex] = useState(0);

  const { data: announcements } = useAnnouncements();

  if (!announcements || announcements.length === 0) return null;

  const handleChangeIndex = (index: number) => {
    setIndex(index % announcements.length);
  };

  return (
    <Widget title={<FormattedMessage id='announcements.title' defaultMessage='Announcements' />}>
      <Card className='relative black:rounded-xl black:border black:border-gray-800' size='md' variant='rounded'>
        <ReactSwipeableViews animateHeight index={index} onChangeIndex={handleChangeIndex}>
          {announcements.map((announcement) => (
            <Announcement
              key={announcement.id}
              announcement={announcement}
              emojiMap={emojiMap}
            />
          )).toReversed()}
        </ReactSwipeableViews>
        {announcements.length > 1 && (
          <HStack space={2} alignItems='center' justifyContent='center' className='relative'>
            {announcements.map((_, i) => (
              <button
                key={i}
                tabIndex={0}
                onClick={() => setIndex(i)}
                className={clsx({
                  'w-2 h-2 rounded-full focus:ring-primary-600 focus:ring-2 focus:ring-offset-2': true,
                  'bg-gray-200 hover:bg-gray-300': i !== index,
                  'bg-primary-600': i === index,
                })}
              />
            ))}
          </HStack>
        )}
      </Card>
    </Widget>
  );
};

export { AnnouncementsPanel as default };
