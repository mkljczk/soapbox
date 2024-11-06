// Adapted from Mastodon https://github.com/mastodon/mastodon/blob/main/app/javascript/mastodon/components/hashtag_bar.tsx
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import HStack from './ui/hstack';
import Text from './ui/text';

// Fit on a single line on desktop
const VISIBLE_HASHTAGS = 3;

interface IHashtagsBar {
  hashtags: Array<string>;
}

const HashtagsBar: React.FC<IHashtagsBar> = ({ hashtags }) => {
  const [expanded, setExpanded] = useState(false);
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setExpanded(true);
  }, []);

  if (hashtags.length === 0) {
    return null;
  }

  const revealedHashtags = expanded
    ? hashtags
    : hashtags.slice(0, VISIBLE_HASHTAGS);

  return (
    <HStack space={2} wrap>
      {revealedHashtags.map((hashtag) => (
        <Link
          key={hashtag}
          to={`/tags/${hashtag}`}
          onClick={(e) => e.stopPropagation()}
          className='flex items-center rounded-sm bg-gray-100 px-1.5 py-1 text-center text-xs font-medium text-primary-600 black:bg-primary-900 dark:bg-primary-700 dark:text-white'
        >
          <Text size='xs' weight='semibold' theme='inherit'>
            #<span>{hashtag}</span>
          </Text>
        </Link>
      ))}

      {!expanded && hashtags.length > VISIBLE_HASHTAGS && (
        <button onClick={handleClick}>
          <Text className='hover:underline' size='xs' weight='semibold' theme='muted'>
            <FormattedMessage
              id='hashtags.and_other'
              defaultMessage='…and {count, plural, other {# more}}'
              values={{ count: hashtags.length - VISIBLE_HASHTAGS }}
            />
          </Text>
        </button>
      )}
    </HStack>
  );
};

export { HashtagsBar as default };
