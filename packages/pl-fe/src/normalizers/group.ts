import type { Group as BaseGroup } from 'pl-api';

const getDomainFromURL = (group: Pick<BaseGroup, 'url'>): string => {
  try {
    const url = group.url;
    return new URL(url).host;
  } catch {
    return '';
  }
};

const normalizeGroup = (group: BaseGroup) => {
  const missingAvatar = require('pl-fe/assets/images/avatar-missing.png');
  const missingHeader = require('pl-fe/assets/images/header-missing.png');

  const domain = getDomainFromURL(group);

  return {
    ...group,
    avatar: group.avatar || group.avatar_static || missingAvatar,
    avatar_static: group.avatar_static || group.avatar || missingAvatar,
    header: group.header || group.header_static || missingHeader,
    header_static: group.header_static || group.header || missingHeader,
    domain,
  };
};

type Group = ReturnType<typeof normalizeGroup>;

export { normalizeGroup, type Group };
