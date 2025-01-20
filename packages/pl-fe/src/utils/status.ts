import type { Status } from 'pl-fe/normalizers/status';
import type { IntlShape } from 'react-intl';

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

/** Sanitize status text for use with screen readers. */
const textForScreenReader = (
  intl: IntlShape,
  status: Pick<Status, 'account' | 'spoiler_text' | 'search_index' | 'created_at'>,
  rebloggedByText?: string,
): string => {
  const { account } = status;
  if (!account || typeof account !== 'object') return '';

  const displayName = account.display_name;

  const values = [
    displayName.length === 0 ? account.acct.split('@')[0] : displayName,
    status.spoiler_text ? status.spoiler_text : status.search_index?.slice(status.spoiler_text.length) || '',
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
  shouldHaveCard,
  textForScreenReader,
  getStatusIdsFromLinksInContent,
};
