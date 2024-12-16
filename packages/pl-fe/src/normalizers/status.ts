/**
 * Status normalizer:
 * Converts API statuses into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/status/}
 */
import omit from 'lodash/omit';
import { type Account as BaseAccount, type Status as BaseStatus, type MediaAttachment, mentionSchema } from 'pl-api';
import * as v from 'valibot';

import { unescapeHTML } from 'pl-fe/utils/html';

import { normalizeAccount } from './account';
import { normalizeGroup } from './group';

const domParser = new DOMParser();

type StatusApprovalStatus = Exclude<BaseStatus['approval_status'], null>;
type StatusVisibility = 'public' | 'unlisted' | 'private' | 'direct' | 'group' | 'mutuals_only' | 'local';

type OldStatus = Pick<BaseStatus, 'content' | 'spoiler_text'> & { search_index: string };

// Gets titles of poll options from status
const getPollOptionTitles = ({ poll }: Pick<BaseStatus, 'poll'>): readonly string[] => {
  if (poll && typeof poll === 'object') {
    return poll.options.map(({ title }) => title);
  } else {
    return [];
  }
};

// Gets usernames of mentioned users from status
const getMentionedUsernames = (status: Pick<BaseStatus, 'mentions'>): Array<string> =>
  status.mentions.map(({ acct }) => `@${acct}`);

// Creates search text from the status
const buildSearchContent = (status: Pick<BaseStatus, 'poll' | 'mentions' | 'spoiler_text' | 'content'>): string => {
  const pollOptionTitles = getPollOptionTitles(status);
  const mentionedUsernames = getMentionedUsernames(status);

  const fields = [
    status.spoiler_text,
    status.content,
    ...pollOptionTitles,
    ...mentionedUsernames,
  ];

  return unescapeHTML(fields.join('\n\n')) || '';
};

const getSearchIndex = (
  status: Pick<BaseStatus, 'poll' | 'mentions' | 'spoiler_text' | 'content'>,
  oldStatus?: Pick<OldStatus, 'content' | 'search_index' | 'spoiler_text'>,
) => {
  if (oldStatus && oldStatus.content === status.content && oldStatus.spoiler_text === status.spoiler_text) {
    return oldStatus.search_index;
  } else {
    const searchContent = buildSearchContent(status);

    return domParser.parseFromString(searchContent, 'text/html').documentElement.textContent || '';
  }
};

const normalizeStatus = (status: BaseStatus & {
  accounts?: Array<BaseAccount>;
}, oldStatus?: Pick<OldStatus, 'content' | 'search_index' | 'spoiler_text'>) => {
  const searchIndex = getSearchIndex(status, oldStatus);

  // Sort the replied-to mention to the top
  let mentions = status.mentions.toSorted((a, _b) => {
    if (a.id === status.in_reply_to_account_id) {
      return -1;
    } else {
      return 0;
    }
  });

  // Add self to mentions if it's a reply to self
  const isSelfReply = status.account.id === status.in_reply_to_account_id;
  const hasSelfMention = status.mentions.some(mention => status.account.id === mention.id);

  if (isSelfReply && !hasSelfMention) {
    const selfMention = v.parse(mentionSchema, status.account);
    mentions = [selfMention, ...mentions];
  }

  // Normalize event
  let event: BaseStatus['event'] & ({
    banner: MediaAttachment | null;
    links: Array<MediaAttachment>;
  } | null) = null;
  let media_attachments = status.media_attachments;

  if (status.event) {
    const firstAttachment = status.media_attachments[0];
    let banner: MediaAttachment | null = null;

    if (firstAttachment?.description === 'Banner' && firstAttachment.type === 'image') {
      banner = firstAttachment;
      media_attachments = media_attachments.slice(1);
    }

    const links = media_attachments.filter(attachment => attachment.mime_type === 'text/html');
    media_attachments = media_attachments.filter(attachment => attachment.mime_type !== 'text/html');

    event = {
      ...status.event,
      banner,
      links,
    };
  }

  // Normalize group
  const group = status.group ? normalizeGroup(status.group) : null;

  return omit({
    account_id: status.account.id,
    reblog_id: status.reblog?.id || null,
    poll_id: status.poll?.id || null,
    group_id: status.group?.id || null,
    expectsCard: false,
    deleted: false,
    ...status,
    quote_id: status.quote?.id || status.quote_id || null,
    account: normalizeAccount(status.account),
    accounts: status.accounts?.map(normalizeAccount),
    mentions,
    filtered: status.filtered?.map(result => result.filter.title),
    event,
    group,
    media_attachments,
    search_index: searchIndex,
  }, ['group', 'quote']);
};

type Status = ReturnType<typeof normalizeStatus>;

export {
  type StatusApprovalStatus,
  type StatusVisibility,
  normalizeStatus,
  type Status,
};
