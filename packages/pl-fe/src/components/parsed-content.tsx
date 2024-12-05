/* eslint-disable no-redeclare */
import parse, { Element, type HTMLReactParserOptions, domToReact, type DOMNode } from 'html-react-parser';
import DOMPurify from 'isomorphic-dompurify';
import groupBy from 'lodash/groupBy';
import minBy from 'lodash/minBy';
import React from 'react';
import { Link } from 'react-router-dom';

import Emojify from 'pl-fe/features/emoji/emojify';
import { makeEmojiMap } from 'pl-fe/utils/normalizers';

import HashtagLink from './hashtag-link';
import HoverAccountWrapper from './hover-account-wrapper';
import StatusMention from './status-mention';

import type { CustomEmoji, Mention } from 'pl-api';

const nodesToText = (nodes: Array<DOMNode>): string =>
  nodes.map(node => node.type === 'text' ? node.data : node.type === 'tag' ? nodesToText(node.children as Array<DOMNode>) : '').join('');

interface IParsedContent {
  /** HTML content to display. */
  html: string;
  /** Array of mentioned accounts. */
  mentions?: Array<Mention>;
  /** Whether it's a status which has a quote. */
  hasQuote?: boolean;
  /** Related custom emojis. */
  emojis?: Array<CustomEmoji>;
}

// Adapted from Mastodon https://github.com/mastodon/mastodon/blob/main/app/javascript/mastodon/components/hashtag_bar.tsx
const normalizeHashtag = (hashtag: string) =>(
  !!hashtag && hashtag.startsWith('#') ? hashtag.slice(1) : hashtag
).normalize('NFKC');

const uniqueHashtagsWithCaseHandling = (hashtags: string[]) => {
  const groups = groupBy(hashtags, (tag) =>
    tag.normalize('NFKD').toLowerCase(),
  );

  return Object.values(groups).map((tags) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we know that the array has at least one element
    const firstTag = tags[0]!;

    if (tags.length === 1) return firstTag;

    // The best match is the one where we have the less difference between upper and lower case letter count
    const best = minBy(tags, (tag) => {
      const upperCase = Array.from(tag).reduce(
        (acc, char) => (acc += char.toUpperCase() === char ? 1 : 0),
        0,
      );

      const lowerCase = tag.length - upperCase;

      return Math.abs(lowerCase - upperCase);
    });

    return best ?? firstTag;
  });
};

function parseContent(props: IParsedContent): ReturnType<typeof domToReact>;
function parseContent(props: IParsedContent, extractHashtags: true): {
  hashtags: Array<string>;
  content: ReturnType<typeof domToReact>;
};

function parseContent({ html, mentions, hasQuote, emojis }: IParsedContent, extractHashtags = false) {
  if (html.length === 0) {
    return extractHashtags ? { content: null, hashtags: [] } : null;
  }

  const emojiMap = emojis ? makeEmojiMap(emojis) : undefined;

  const selectors: Array<string> = [];

  // Explicit mentions
  if (mentions) selectors.push('recipients-inline');

  // Quote posting
  if (hasQuote) selectors.push('quote-inline');

  const hashtags: Array<string> = [];

  const options: HTMLReactParserOptions = {
    replace(domNode, index) {
      if (!(domNode instanceof Element)) {
        return;
      }

      if (['script', 'iframe'].includes(domNode.name)) {
        return <></>;
      }

      if (domNode.attribs.class?.split(' ').some(className => selectors.includes(className))) {
        return <></>;
      }

      if (domNode.name === 'a') {
        const classes = domNode.attribs.class?.split(' ');

        const fallback = (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <a
            {...domNode.attribs}
            onClick={(e) => e.stopPropagation()}
            rel='nofollow noopener'
            target='_blank'
            title={domNode.attribs.href}
          >
            {domToReact(domNode.children as DOMNode[], options)}
          </a>
        );

        if (classes?.includes('mention')) {
          if (mentions) {
            const mention = mentions.find(({ url }) => domNode.attribs.href === url);
            if (mention) {
              return (
                <HoverAccountWrapper accountId={mention.id} element='span'>
                  <Link
                    to={`/@${mention.acct}`}
                    className='text-primary-600 dark:text-accent-blue hover:underline'
                    dir='ltr'
                    onClick={(e) => e.stopPropagation()}
                  >
                    @{mention.username}
                  </Link>
                </HoverAccountWrapper>
              );
            }
          } else if (domNode.attribs['data-user']) {
            return (
              <StatusMention accountId={domNode.attribs['data-user']} fallback={fallback} />
            );
          }
        }

        if (classes?.includes('hashtag')) {
          const hashtag = nodesToText(domNode.children as Array<DOMNode>);
          if (hashtag) {
            return <HashtagLink hashtag={hashtag.replace(/^#/, '')} />;
          }
        }

        return fallback;
      }

      if (extractHashtags && domNode.type === 'tag' && domNode.parent === null && domNode.next === null) {
        for (const child of domNode.children) {
          switch (child.type) {
            case 'text':
              if (child.data.trim().length) return;
              break;
            case 'tag':
              if (child.name !== 'a') return;
              if (!child.attribs.class?.split(' ').includes('hashtag')) return;
              hashtags.push(normalizeHashtag(nodesToText([child])));
              break;
            default:
              return;
          }
        }

        return <></>;
      }
    },

    transform(reactNode, _domNode, index) {
      if (typeof reactNode === 'string') {
        return <Emojify key={index} text={reactNode} emojis={emojiMap} />;
      }

      return reactNode as JSX.Element;
    },
  };

  const content = parse(DOMPurify.sanitize(html, { ADD_ATTR: ['target'], USE_PROFILES: { html: true } }), options);

  if (extractHashtags) return {
    content,
    hashtags: uniqueHashtagsWithCaseHandling(hashtags),
  };

  return content;
}

const ParsedContent: React.FC<IParsedContent> = React.memo((props) => parseContent(props), (prevProps, nextProps) => prevProps.html === nextProps.html);

export { ParsedContent, parseContent };
