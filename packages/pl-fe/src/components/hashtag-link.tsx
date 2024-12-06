import React from 'react';

import Link from './link';

interface IHashtagLink {
  hashtag: string;
}

const HashtagLink: React.FC<IHashtagLink> = ({ hashtag }) => (
  <Link to={`/tags/${hashtag}`} onClick={(e) => e.stopPropagation()}>
    #{hashtag}
  </Link>
);

export { HashtagLink as default };
