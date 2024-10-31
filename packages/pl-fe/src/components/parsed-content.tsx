import parse, { Element, type HTMLReactParserOptions, domToReact, type DOMNode } from 'html-react-parser';
import DOMPurify from 'isomorphic-dompurify';
import React, { useMemo } from 'react';
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

const ParsedContent: React.FC<IParsedContent> = (({ html, mentions, hasQuote, emojis }) => {
  return useMemo(() => {
    if (html.length === 0) {
      return null;
    }

    const emojiMap = emojis ? makeEmojiMap(emojis) : undefined;

    const selectors: Array<string> = [];

    // Explicit mentions
    if (mentions) selectors.push('recipients-inline');

    // Quote posting
    if (hasQuote) selectors.push('quote-inline');

    const options: HTMLReactParserOptions = {
      replace(domNode) {
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
                      className='text-primary-600 hover:underline dark:text-accent-blue'
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
      },

      transform(reactNode, _domNode, index) {
        if (typeof reactNode === 'string') {
          return <Emojify key={index} text={reactNode} emojis={emojiMap} />;
        }

        return reactNode as JSX.Element;
      },
    };

    return parse(DOMPurify.sanitize(html, { ADD_ATTR: ['target'], USE_PROFILES: { html: true } }), options);
  }, [html]);
});

export { ParsedContent };
