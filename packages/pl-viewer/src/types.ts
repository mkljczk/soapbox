type Context = Array<string | Record<string, unknown>> | string;

type OrderedColllection<T> = {
  '@context': Context;
  id: string;
  type: 'OrderedCollection';
  totalItems: number;
  orderedItems: Array<T>;
}

type Attachment = {
  type: string;
  mediaType: string;
  url: string;
  name: string;
  blurhash: string;
  duration: string;
  width: number;
  height: number;
}

type Tag = {
  type: 'Mention';
  href: string;
  name: string;
}

type Activity = {
  id: string;
  actor: string;
  published: string;
  to: Array<string>;
  cc: Array<string>;
} & ({
  type: 'Create';
  object: Object;
} | {
  type: 'Announce';
  object: string;
});

type Object = {
  id: string;
  type: string;
  summary: string;
  inReplyTo: string;
  published: string;
  url: string;
  attributedTo: string;
  to: Array<string>;
  cc: Array<string>;
  sensitive: boolean;
  atomUri: string;
  inReplyToAtomUri: string;
  conversation: string;
  content: string;
  contentMap: Record<string, string>;
  attachment: Array<Attachment>;
  tag: Array<Tag>;
  // replies: TODO;
  likes: {
    id: string;
    type: 'Collection';
    totalItems: number;
  };
  shares: {
    id: string;
    type: 'Collection';
    totalItems: number;
  };
}

type Actor = {
  '@context': Context;
  id: string;
  type: string;

  preferredUsername: string;
  name: string;
  summary: string;
  url: string;
  manuallyApprovesFollowers: boolean;
  discoverable: boolean;
  indexable: boolean;
  published: string;
  memorial: boolean;
  alsoKnownAs: Array<string>;
  publicKey: {
    id: string;
    owner: string;
    publicKeyPem: string;
  }
  // tag: Array<Tag>;
  // attachment: Array<Attachment>;
  endpoints: {
    sharedInbox: string;
  }

  following?: string;
  followers?: string;
  bookmarks?: string;
  likes?: string;
  outbox?: string;
  featured?: string;
  featuredTags?: string;
}

export type {
  OrderedColllection,
  Activity,
  Object,
  Actor,
}
