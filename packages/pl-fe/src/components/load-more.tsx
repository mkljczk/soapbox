import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from 'pl-fe/components/ui/button';

interface ILoadMore {
  onClick: React.MouseEventHandler;
  disabled?: boolean;
  visible?: boolean;
  className?: string;
}

const LoadMore: React.FC<ILoadMore> = ({ onClick, disabled, visible = true, className }) => {
  if (!visible) {
    return null;
  }

  return (
    <Button className={className} theme='primary' block disabled={disabled || !visible} onClick={onClick}>
      <FormattedMessage id='status.load_more' defaultMessage='Load more' />
    </Button>
  );
};

export { LoadMore as default };
