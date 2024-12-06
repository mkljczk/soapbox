import type { Account } from 'pl-fe/normalizers/account';

/** Convert a plain tag into a badge. */
const tagToBadge = (tag: string) => `badge:${tag}`;

/** Convert a badge into a plain tag. */
const badgeToTag = (badge: string) => badge.replace(/^badge:/, '');

/** Difference between an old and new set of tags. */
interface TagDiff {
  /** New tags that were added. */
  added: string[];
  /** Old tags that were removed. */
  removed: string[];
}

/** Returns the differences between two sets of tags. */
const getTagDiff = (oldTags: string[], newTags: string[]): TagDiff => ({
  added: newTags.filter(tag => !oldTags.includes(tag)),
  removed: oldTags.filter(tag => !newTags.includes(tag)),
});

/** Returns only tags which are badges. */
const filterBadges = (tags: string[]): string[] => tags.filter(tag => tag.startsWith('badge:'));

/** Get badges from an account. */
const getBadges = (account: Pick<Account, '__meta'>) => {
  const tags = account.__meta.pleroma?.tags ?? [];
  return filterBadges(tags);
};

export {
  tagToBadge,
  badgeToTag,
  filterBadges,
  getTagDiff,
  getBadges,
};
