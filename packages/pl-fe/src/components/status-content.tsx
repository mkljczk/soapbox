import clsx from 'clsx';
import React, { useState, useRef, useLayoutEffect, useMemo, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { collapseStatusSpoiler, expandStatusSpoiler } from 'pl-fe/actions/statuses';
import Icon from 'pl-fe/components/icon';
import Button from 'pl-fe/components/ui/button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Emojify from 'pl-fe/features/emoji/emojify';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { onlyEmoji as isOnlyEmoji } from 'pl-fe/utils/rich-content';

import { getTextDirection } from '../utils/rtl';

import Markup from './markup';
import { ParsedContent } from './parsed-content';
import Poll from './polls/poll';

import type { Sizes } from 'pl-fe/components/ui/text';
import type { MinifiedStatus } from 'pl-fe/reducers/statuses';

const BIG_EMOJI_LIMIT = 10;

interface IReadMoreButton {
  onClick: React.MouseEventHandler;
  quote?: boolean;
  poll?: boolean;
}

/** Button to expand a truncated status (due to too much content) */
const ReadMoreButton: React.FC<IReadMoreButton> = ({ onClick, quote, poll }) => (
  <div className='relative -mt-4'>
    <div
      className={clsx('absolute -top-16 h-16 w-full bg-gradient-to-b from-transparent', {
        'to-white black:to-black dark:to-primary-900': !poll,
        'to-gray-100 dark:to-primary-800': poll,
        'group-hover:to-gray-100 black:group-hover:to-gray-800 dark:group-hover:to-gray-800': quote,
      })}
    />
    <button className='flex items-center border-0 bg-transparent p-0 pt-2 text-gray-900 hover:underline active:underline dark:text-gray-300' onClick={onClick}>
      <FormattedMessage id='status.read_more' defaultMessage='Read more' />
      <Icon className='inline-block size-5' src={require('@tabler/icons/outline/chevron-right.svg')} />
    </button>
  </div>
);

interface IStatusContent {
  status: MinifiedStatus;
  onClick?: () => void;
  collapsable?: boolean;
  translatable?: boolean;
  textSize?: Sizes;
  quote?: boolean;
}

/** Renders the text content of a status */
const StatusContent: React.FC<IStatusContent> = React.memo(({
  status,
  onClick,
  collapsable = false,
  translatable,
  textSize = 'md',
  quote = false,
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

    if (collapsable && !collapsed) {
      // 20px * x lines (+ 2px padding at the top)
      if (node.current.clientHeight > (quote ? 202 : 282)) {
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
    'max-h-[200px]': collapsed && !quote,
    'max-h-[120px]': collapsed && quote,
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
          <ParsedContent html={content} mentions={status.mentions} hasQuote={!!status.quote_id} emojis={status.emojis} />
        </Markup>,
      );
    }

    const hasPoll = !!status.poll_id;

    if (collapsed) {
      output.push(<ReadMoreButton onClick={onClick} key='read-more' quote={quote} poll={hasPoll} />);
    }

    if (status.poll_id) {
      output.push(<Poll id={status.poll_id} key='poll' status={status} />);
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
          <ParsedContent html={content} mentions={status.mentions} hasQuote={!!status.quote_id} emojis={status.emojis} />
        </Markup>,
      );
    }

    if (collapsed) {
      output.push(<ReadMoreButton onClick={() => {}} key='read-more' quote={quote} />);
    }

    if (status.poll_id) {
      output.push(<Poll id={status.poll_id} key='poll' status={status} />);
    }

    return <>{output}</>;
  }
});

export { StatusContent as default };
