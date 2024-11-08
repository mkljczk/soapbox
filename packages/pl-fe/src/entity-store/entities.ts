import type { AdminDomain, AdminRelay, AdminRule, BookmarkFolder, GroupMember, GroupRelationship, Relationship, Scrobble, TrendsLink } from 'pl-api';
import type { Account } from 'pl-fe/normalizers/account';
import type { Group } from 'pl-fe/normalizers/group';
import type { Status } from 'pl-fe/normalizers/status';

enum Entities {
  ACCOUNTS = 'Accounts',
  BOOKMARK_FOLDERS = 'BookmarkFolders',
  DOMAINS = 'Domains',
  GROUPS = 'Groups',
  GROUP_MEMBERSHIPS = 'GroupMemberships',
  GROUP_MUTES = 'GroupMutes',
  GROUP_RELATIONSHIPS = 'GroupRelationships',
  RELATIONSHIPS = 'Relationships',
  RELAYS = 'Relays',
  RULES = 'Rules',
  SCROBBLES = 'Scrobbles',
  STATUSES = 'Statuses',
  TRENDS_LINKS = 'TrendsLinks',
}

interface EntityTypes {
  [Entities.ACCOUNTS]: Account;
  [Entities.BOOKMARK_FOLDERS]: BookmarkFolder;
  [Entities.DOMAINS]: AdminDomain;
  [Entities.GROUPS]: Group;
  [Entities.GROUP_MEMBERSHIPS]: GroupMember;
  [Entities.GROUP_RELATIONSHIPS]: GroupRelationship;
  [Entities.RELATIONSHIPS]: Relationship;
  [Entities.RELAYS]: AdminRelay;
  [Entities.RULES]: AdminRule;
  [Entities.SCROBBLES]: Scrobble;
  [Entities.STATUSES]: Status;
  [Entities.TRENDS_LINKS]: TrendsLink;
}

export { Entities, type EntityTypes };
