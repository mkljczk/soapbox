import clsx from 'clsx';
import React, { useState, useRef, useLayoutEffect, useMemo, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { collapseStatusSpoiler, expandStatusSpoiler } from 'pl-fe/actions/statuses';
import Icon from 'pl-fe/components/icon';
import Button from 'pl-fe/components/ui/button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Emojify from 'pl-fe/features/emoji/emojify';
import QuotedStatus from 'pl-fe/features/status/containers/quoted-status-container';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { onlyEmoji as isOnlyEmoji } from 'pl-fe/utils/rich-content';

import { getTextDirection } from '../utils/rtl';

import HashtagsBar from './hashtags-bar';
import Markup from './markup';
import { parseContent } from './parsed-content';
import Poll from './polls/poll';
import StatusMedia from './status-media';
import SensitiveContentOverlay from './statuses/sensitive-content-overlay';
import TranslateButton from './translate-button';

import type { Sizes } from 'pl-fe/components/ui/text';
import type { MinifiedStatus } from 'pl-fe/reducers/statuses';

const BIG_EMOJI_LIMIT = 10;

interface IReadMoreButton {
  onClick: React.MouseEventHandler;
  quote?: boolean;
  poll?: boolean;
  preview?: boolean;
}

/** Button to expand a truncated status (due to too much content) */
const ReadMoreButton: React.FC<IReadMoreButton> = ({ onClick, quote, poll, preview }) => (
  <div
    className={clsx('relative', {
      '-mt-4': !preview,
      '-mt-2': preview,
    })}
  >
    <div
      className={clsx('absolute -top-16 h-16 w-full bg-gradient-to-b from-transparent', {
        'to-white black:to-black dark:to-primary-900': !poll,
        'to-gray-100 dark:to-primary-800': poll,
        'group-hover:to-gray-100 black:group-hover:to-gray-800 dark:group-hover:to-gray-800': quote,
      })}
    />
    {!preview && (
      <button className='flex items-center border-0 bg-transparent p-0 pt-2 text-gray-900 hover:underline active:underline dark:text-gray-300' onClick={onClick}>
        <FormattedMessage id='status.read_more' defaultMessage='Read more' />
        <Icon className='inline-block size-5' src={require('@tabler/icons/outline/chevron-right.svg')} />
      </button>
    )}
  </div>
);

interface IStatusContent {
  status: MinifiedStatus;
  onClick?: () => void;
  collapsable?: boolean;
  translatable?: boolean;
  textSize?: Sizes;
  isQuote?: boolean;
  preview?: boolean;
  withMedia?: boolean;
}

/** Renders the text content of a status */
const StatusContent: React.FC<IStatusContent> = React.memo(({
  status,
  onClick,
  collapsable = false,
  translatable,
  textSize = 'md',
  isQuote = false,
  preview,
  withMedia,
}) => {
  const dispatch = useAppDispatch();
  const { displaySpoilers } = useSettings();

  const [collapsed, setCollapsed] = useState(false);
  const [onlyEmoji, setOnlyEmoji] = useState(false);
  const [lineClamp, setLineClamp] = useState(true);

  const node = useRef<HTMLDivElement>(null);
  const spoilerNode = useRef<HTMLSpanElement>(null);

  const maybeSetCollapsed = (): void => {
    if (!node.current) return;

    if ((collapsable || preview) && !collapsed) {
      // 20px * x lines (+ 2px padding at the top)
      if (node.current.clientHeight > (preview ? 82 : isQuote ? 202 : 282)) {
        setCollapsed(true);
      }
    }
  };

  const maybeSetOnlyEmoji = (): void => {
    if (!node.current) return;
    const only = isOnlyEmoji(node.current, BIG_EMOJI_LIMIT, true);

    if (only !== onlyEmoji) {
      setOnlyEmoji(only);
    }
  };

  const toggleExpanded: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (expanded) dispatch(collapseStatusSpoiler(status.id));
    else dispatch(expandStatusSpoiler(status.id));
  };

  useLayoutEffect(() => {
    maybeSetCollapsed();
    maybeSetOnlyEmoji();
  });

  const content = useMemo(
    (): string => translatable && status.translation
      ? status.translation.content!
      : (status.content_map && status.currentLanguage)
        ? (status.content_map[status.currentLanguage] || status.content)
        : status.content,
    [status.content, status.translation, status.currentLanguage],
  );

  const { content: parsedContent, hashtags } = useMemo(() => parseContent({
    html: content,
    mentions: status.mentions,
    hasQuote: !!status.quote_id,
    emojis: status.emojis,
  }, true), [content]);

  useEffect(() => {
    setLineClamp(!spoilerNode.current || spoilerNode.current.clientHeight >= 96);
  }, [spoilerNode.current]);

  const withSpoiler = status.spoiler_text.length > 0;

  const spoilerText = status.spoiler_text_map && status.currentLanguage
    ? status.spoiler_text_map[status.currentLanguage] || status.spoiler_text
    : status.spoiler_text;

  const direction = getTextDirection(status.search_index);
  const className = clsx('relative text-ellipsis break-words text-gray-900 focus:outline-none dark:text-gray-100', {
    'cursor-pointer': onClick,
    'overflow-hidden': collapsed,
    'max-h-[200px]': collapsed && !isQuote && !preview,
    'max-h-[120px]': collapsed && isQuote,
    'max-h-[80px]': collapsed && preview,
    'leading-normal big-emoji': onlyEmoji,
  });

  const expandable = !displaySpoilers;
  const expanded = !withSpoiler || status.expanded || false;

  const output = [];

  if (spoilerText) {
    output.push(
      <Text key='spoiler' size='2xl' weight='medium'>
        <span className={clsx({ 'line-clamp-3': !expanded && lineClamp })} ref={spoilerNode}>
          <Emojify text={spoilerText} emojis={status.emojis} />
        </span>
        {status.content && expandable && (
          <Button
            className='ml-2 align-middle'
            type='button'
            theme='muted'
            size='xs'
            onClick={toggleExpanded}
            icon={expanded ? require('@tabler/icons/outline/chevron-up.svg') : require('@tabler/icons/outline/chevron-down.svg')}
          >
            {expanded
              ? <FormattedMessage id='status.spoiler.collapse' defaultMessage='Collapse' />
              : <FormattedMessage id='status.spoiler.expand' defaultMessage='Expand' />}
          </Button>
        )}
      </Text>,
    );
  }

  if (expandable && !expanded) return <>{output}</>;

  let quote;

  if (withMedia && status.quote_id) {
    if ((status.quote_visible ?? true) === false) {
      quote = (
        <div className='quoted-status-tombstone'>
          <p><FormattedMessage id='statuses.quote_tombstone' defaultMessage='Post is unavailable.' /></p>
        </div>
      );
    } else {
      quote = <QuotedStatus statusId={status.quote_id} />;
    }
  }

  const media = withMedia && ((quote || status.card || status.media_attachments.length > 0)) && (
    <Stack space={4}>
      {(status.media_attachments.length > 0 || (status.card && !quote)) && (
        <div className='relative'>
          <SensitiveContentOverlay status={status} />
          <StatusMedia status={status} />
        </div>
      )}

      {quote}
    </Stack>
  );

  if (onClick) {
    if (status.content) {
      output.push(
        <Markup
          ref={node}
          tabIndex={0}
          key='content'
          className={className}
          direction={direction}
          lang={status.language || undefined}
          size={textSize}
        >
          {parsedContent}
        </Markup>,
      );
    }

    const hasPoll = !!status.poll_id;

    if (collapsed) {
      output.push(<ReadMoreButton onClick={onClick} key='read-more' quote={isQuote} poll={hasPoll} />);
    }

    if (status.poll_id) {
      output.push(<Poll id={status.poll_id} key='poll' status={status} />);
    }

    if (translatable) {
      output.push(<TranslateButton status={status} />);
    }

    if (media) {
      output.push(media);
    }

    if (hashtags.length) {
      output.push(<HashtagsBar key='hashtags' hashtags={hashtags} />);
    }

    return <Stack space={4} className={clsx({ 'bg-gray-100 dark:bg-primary-800 rounded-md p-4': hasPoll })}>{output}</Stack>;
  } else {
    if (status.content) {
      output.push(
        <Markup
          ref={node}
          tabIndex={0}
          key='content'
          className={className}
          direction={direction}
          lang={status.language || undefined}
          size={textSize}
        >
          {parsedContent}
        </Markup>,
      );
    }

    if (collapsed) {
      output.push(<ReadMoreButton onClick={() => {}} key='read-more' quote={isQuote} preview={preview} />);
    }

    if (status.poll_id) {
      output.push(<Poll id={status.poll_id} key='poll' status={status} />);
    }

    if (translatable) {
      output.push(<TranslateButton status={status} />);
    }

    return <>{output}</>;
  }
});

export { StatusContent as default };
