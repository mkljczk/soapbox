import { type Account as BaseAccount, type Status as BaseStatus, type MediaAttachment, mentionSchema } from 'pl-api';
import * as v from 'valibot';

type StatusApprovalStatus = Exclude<BaseStatus['approval_status'], null>;
type StatusVisibility = 'public' | 'unlisted' | 'private' | 'direct' | 'group' | 'mutuals_only' | 'local';

const normalizeStatus = ({ account, accounts, reblog, poll, group, quote, ...status }: BaseStatus & { accounts?: Array<BaseAccount> }) => {
  // Sort the replied-to mention to the top
  let mentions = status.mentions.toSorted((a, _b) => {
    if (a.id === status.in_reply_to_account_id) {
      return -1;
    } else {
      return 0;
    }
  });

  // Add self to mentions if it's a reply to self
  const isSelfReply = account.id === status.in_reply_to_account_id;
  const hasSelfMention = status.mentions.some(mention => account.id === mention.id);

  if (isSelfReply && !hasSelfMention) {
    const selfMention = v.parse(mentionSchema, account);
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

  return {
    account_id: account.id,
    account_ids: accounts?.map(account => account.id) || [account.id],
    reblog_id: reblog?.id || null,
    poll_id: poll?.id || null,
    group_id: group?.id || null,
    expectsCard: false,
    showFiltered: null as null | boolean,
    ...status,
    quote_id: quote?.id || status.quote_id || null,
    mentions,
    filtered: status.filtered?.map(result => result.filter.title),
    event,
    media_attachments,
  };
};

type Status = ReturnType<typeof normalizeStatus>;

export {
  type StatusApprovalStatus,
  type StatusVisibility,
  normalizeStatus,
  type Status as NormalizedStatus,
};
