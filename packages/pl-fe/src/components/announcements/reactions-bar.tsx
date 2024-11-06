import React from 'react';
import { TransitionMotion, spring } from 'react-motion';

import { useAnnouncements } from 'pl-fe/api/hooks/announcements/use-announcements';
import EmojiPickerDropdown from 'pl-fe/features/emoji/containers/emoji-picker-dropdown-container';
import { useSettings } from 'pl-fe/hooks/use-settings';

import Reaction from './reaction';

import type { AnnouncementReaction, CustomEmoji } from 'pl-api';
import type { Emoji, NativeEmoji } from 'pl-fe/features/emoji';

interface IReactionsBar {
  announcementId: string;
  reactions: Array<AnnouncementReaction>;
  emojiMap: Record<string, CustomEmoji>;
}

const ReactionsBar: React.FC<IReactionsBar> = ({ announcementId, reactions, emojiMap }) => {
  const { reduceMotion } = useSettings();
  const { addReaction } = useAnnouncements();

  const handleEmojiPick = (data: Emoji) => {
    addReaction({ announcementId, name: (data as NativeEmoji).native.replace(/:/g, '') });
  };

  const willEnter = () => ({ scale: reduceMotion ? 1 : 0 });

  const willLeave = () => ({ scale: reduceMotion ? 0 : spring(0, { stiffness: 170, damping: 26 }) });

  const visibleReactions = reactions.filter(x => x.count > 0);

  const styles = visibleReactions.map(reaction => ({
    key: reaction.name,
    data: reaction,
    style: { scale: reduceMotion ? 1 : spring(1, { stiffness: 150, damping: 13 }) },
  }));

  return (
    <TransitionMotion styles={styles} willEnter={willEnter} willLeave={willLeave}>
      {items => (
        <div className='flex flex-wrap items-center gap-1'>
          {items.map(({ key, data, style }) => (
            <Reaction
              key={key}
              reaction={data}
              style={{ transform: `scale(${style.scale})`, position: style.scale < 0.5 ? 'absolute' : 'static' }}
              announcementId={announcementId}
              emojiMap={emojiMap}
            />
          ))}

          {visibleReactions.length < 8 && <EmojiPickerDropdown onPickEmoji={handleEmojiPick} />}
        </div>
      )}
    </TransitionMotion>
  );
};

export { ReactionsBar as default };
