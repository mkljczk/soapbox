import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { openComposeWithText } from 'pl-fe/actions/compose';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';

const Share: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);

    const text = [
      params.get('title'),
      params.get('text'),
      params.get('url'),
    ]
      .filter(v => v)
      .join('\n\n');

    if (text) {
      dispatch(openComposeWithText('compose-modal', text));
    }

    history.replace('/');
  });

  return null;
};

export { Share as default };
