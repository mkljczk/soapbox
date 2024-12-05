import { useLongPress } from '@uidotdev/usehooks';
import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { emojiReact, unEmojiReact } from 'pl-fe/actions/emoji-reacts';
import Emoji from 'pl-fe/components/ui/emoji';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Text from 'pl-fe/components/ui/text';
import EmojiPickerDropdown from 'pl-fe/features/emoji/containers/emoji-picker-dropdown-container';
import unicodeMapping from 'pl-fe/features/emoji/mapping';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { useModalsStore } from 'pl-fe/stores/modals';

import AnimatedNumber from './animated-number';

import type { EmojiReaction } from 'pl-api';
import type { Emoji as EmojiType } from 'pl-fe/features/emoji';
import type { SelectedStatus } from 'pl-fe/selectors';

const messages = defineMessages({
  emojiCount: { id: 'status.reactions.label', defaultMessage: '{count} {count, plural, one {person} other {people}} reacted with {emoji}' },
  addEmoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
});

interface IStatusReactionsBar {
  status: Pick<SelectedStatus, 'id' | 'emoji_reactions'>;
  collapsed?: boolean;
}

interface IStatusReaction {
  status: Pick<SelectedStatus, 'id'>;
  reaction: EmojiReaction;
  obfuscate?: boolean;
  unauthenticated?: boolean;
}

const StatusReaction: React.FC<IStatusReaction> = ({ reaction, status, obfuscate, unauthenticated }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();
  const { openModal } = useModalsStore();

  const bind = useLongPress((e) => {
    if (!features.emojiReactsList || e.type !== 'touchstart') return;

    e.stopPropagation();

    if ('vibrate' in navigator) navigator.vibrate(1);
    openModal('REACTIONS', { statusId: status.id, reaction: reaction.name });
  });

  if (!reaction.count) return null;

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    if (unauthenticated) {
      if (!features.emojiReactsList) return;
      openModal('REACTIONS', { statusId: status.id, reaction: reaction.name });
    } else if (reaction.me) {
      dispatch(unEmojiReact(status, reaction.name));
    } else {
      dispatch(emojiReact(status, reaction.name, reaction.url));
    }
  };

  let shortCode = reaction.name;

  // @ts-ignore
  if (unicodeMapping[shortCode]?.shortcode) {
    // @ts-ignore
    shortCode = unicodeMapping[shortCode].shortcode;
  }

  return (
    <button
      className={clsx('group flex cursor-pointer items-center gap-2 overflow-hidden rounded-md border border-gray-400 px-1.5 py-1 transition-colors', {
        'bg-primary-100 dark:border-primary-400 dark:bg-primary-400 black:border-primary-600 black:bg-primary-600': reaction.me,
        'bg-transparent dark:border-primary-700 dark:bg-primary-700 black:border-primary-800 black:bg-primary-800': !reaction.me,
        'cursor-pointer': !unauthenticated,
        'hover:bg-primary-200 hover:dark:border-primary-300 hover:dark:bg-primary-300 hover:black:bg-primary-500': reaction.me && !unauthenticated,
        'hover:bg-primary-100 hover:dark:border-primary-600 hover:dark:bg-primary-600 hover:black:bg-primary-700': !reaction.me && !unauthenticated,
      })}
      key={reaction.name}
      onClick={handleClick}
      title={intl.formatMessage(messages.emojiCount, {
        emoji: `:${shortCode}:`,
        count: reaction.count,
      })}
      disabled={unauthenticated}
      {...bind}
    >
      <Emoji className='size-5' emoji={reaction.name} src={reaction.url || undefined} />

      <Text size='xs' weight='semibold' theme='inherit'>
        <AnimatedNumber value={reaction.count} obfuscate={obfuscate} short />
      </Text>
    </button>
  );
};

const StatusReactionsBar: React.FC<IStatusReactionsBar> = ({ status, collapsed }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { me } = useLoggedIn();
  const { demetricator } = useSettings();
  const features = useFeatures();

  const handlePickEmoji = (emoji: EmojiType) => {
    dispatch(emojiReact(status, emoji.custom ? emoji.id : emoji.native, emoji.custom ? emoji.imageUrl : undefined));
  };

  if ((demetricator || status.emoji_reactions.length === 0) && collapsed) return null;
  if (status.emoji_reactions.length === 0 && !features.emojiReacts) return null;

  const sortedReactions = status.emoji_reactions.toSorted((a, b) => (b.count || 0) - (a.count || 0));

  return (
    <HStack className='pt-2' space={2} wrap>
      {sortedReactions.map((reaction) => reaction.count ? (
        <StatusReaction
          key={reaction.name}
          status={status}
          reaction={reaction}
          obfuscate={demetricator}
          unauthenticated={!me}
        />
      ) : null)}
      {me && (
        <EmojiPickerDropdown onPickEmoji={handlePickEmoji}>
          <button
            className='emoji-picker-dropdown black:border-primary-800 black:bg-primary-800 hover:black:bg-primary-700 dark:border-primary-700 dark:bg-primary-700 hover:dark:border-primary-600 hover:dark:bg-primary-600 cursor-pointer rounded-md border border-gray-400 bg-transparent p-1.5 transition-colors hover:bg-gray-50'
            title={intl.formatMessage(messages.addEmoji)}
          >
            <Icon
              className='size-4'
              src={require('@tabler/icons/outline/mood-plus.svg')}
            />
          </button>
        </EmojiPickerDropdown>
      )}
    </HStack>
  );
};

export { StatusReactionsBar as default };
