import { isIntegerId } from 'pl-fe/utils/numbers';

import type { Status } from 'pl-fe/normalizers/status';
import type { IntlShape } from 'react-intl';

/** Get the initial visibility of media attachments from user settings. */
const defaultMediaVisibility = (
  status: Pick<Status, 'sensitive'>,
  displayMedia: string,
): boolean => (displayMedia !== 'hide_all' && !status.sensitive || displayMedia === 'show_all');

/** Grab the first external link from a status. */
const getFirstExternalLink = (status: Pick<Status, 'content'>): HTMLAnchorElement | null => {
  try {
    // Pulled from Pleroma's media parser
    const selector = 'a:not(.mention,.hashtag,.attachment,[rel~="tag"])';
    const element = document.createElement('div');
    element.innerHTML = status.content;
    return element.querySelector(selector);
  } catch {
    return null;
  }
};

/** Whether the status is expected to have a Card after it loads. */
const shouldHaveCard = (status: Pick<Status, 'content'>): boolean =>
  Boolean(getFirstExternalLink(status));

/** Whether the media IDs on this status have integer IDs (opposed to FlakeIds). */
// https://gitlab.com/soapbox-pub/soapbox/-/merge_requests/1087
const hasIntegerMediaIds = (status: Pick<Status, 'media_attachments'>): boolean =>
  status.media_attachments.some(({ id }) => isIntegerId(id));

/** Sanitize status text for use with screen readers. */
const textForScreenReader = (
  intl: IntlShape,
  status: Pick<Status, 'account' | 'spoiler_text' | 'hidden' | 'search_index' | 'created_at'>,
  rebloggedByText?: string,
): string => {
  const { account } = status;
  if (!account || typeof account !== 'object') return '';

  const displayName = account.display_name;

  const values = [
    displayName.length === 0 ? account.acct.split('@')[0] : displayName,
    status.spoiler_text && status.hidden ? status.spoiler_text : status.search_index.slice(status.spoiler_text.length),
    intl.formatDate(status.created_at, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
    account.acct,
  ];

  if (rebloggedByText) {
    values.push(rebloggedByText);
  }

  return values.join(', ');
};

const getStatusIdsFromLinksInContent = (content: string): string[] => {
  const urls = content.match(RegExp(`${window.location.origin}/@([a-z\\d_-]+(?:@[^@\\s]+)?)/posts/[a-z0-9]+(?!\\S)`, 'gi'));

  if (!urls) return [];

  return Array.from(new Set(urls
    .map(url => url.split('/').at(-1) as string)
    .filter(url => url)));
};

export {
  defaultMediaVisibility,
  shouldHaveCard,
  hasIntegerMediaIds,
  textForScreenReader,
  getStatusIdsFromLinksInContent,
};
