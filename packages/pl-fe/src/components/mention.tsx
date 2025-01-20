import React from 'react';

import Link from 'pl-fe/components/link';
import Tooltip from 'pl-fe/components/ui/tooltip';

import type { Mention as MentionEntity } from 'pl-api';

interface IMention {
  mention: Pick<MentionEntity, 'acct' | 'username'>;
  disabled?: boolean;
}

/** Mention for display in post content and the composer. */
const Mention: React.FC<IMention> = ({ mention: { acct, username }, disabled }) => {
  const handleClick: React.MouseEventHandler = (e) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <Tooltip text={`@${acct}`}>
      <Link to={`/@${acct}`} onClick={handleClick} dir='ltr'>
        @{username}
      </Link>
    </Tooltip>
  );
};

export { Mention as default };
