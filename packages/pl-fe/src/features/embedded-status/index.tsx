import React, { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { fetchStatus } from 'pl-fe/actions/statuses';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import SiteLogo from 'pl-fe/components/site-logo';
import Status from 'pl-fe/components/status';
import Spinner from 'pl-fe/components/ui/spinner';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useLogo } from 'pl-fe/hooks/use-logo';
import { iframeId } from 'pl-fe/iframe';
import { makeGetStatus } from 'pl-fe/selectors';

interface IEmbeddedStatus {
  params: {
    statusId: string;
  };
}

/** Status to be presented in an iframe for embeds on external websites. */
const EmbeddedStatus: React.FC<IEmbeddedStatus> = ({ params }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const getStatus = useCallback(makeGetStatus(), []);
  const intl = useIntl();
  const logoSrc = useLogo();

  const status = useAppSelector(state => getStatus(state, { id: params.statusId }));

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prevent navigation for UX and security.
    // https://stackoverflow.com/a/71531211
    history.block();

    dispatch(fetchStatus(params.statusId, intl))
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.parent.postMessage({
      type: 'setHeight',
      id: iframeId,
      height: document.getElementsByTagName('html')[0].scrollHeight,
    }, '*');
  }, [status, loading]);

  const logo = logoSrc && (
    <div className='ml-4 flex justify-center align-middle'>
      <SiteLogo className='max-h-[20px] max-w-[112px]' />
    </div>
  );

  const renderInner = () => {
    if (loading) {
      return <Spinner />;
    } else if (status) {
      return <Status status={status} accountAction={logo || undefined} variant='default' />;
    } else {
      return <MissingIndicator nested />;
    }
  };

  return (
    <a
      className='dark:bg-primary-900 block bg-white'
      href={status?.url || '#'}
      onClick={e => e.stopPropagation()}
      target='_blank'
    >
      <div className='pointer-events-none p-4 sm:p-6'>
        {renderInner()}
      </div>
    </a>
  );
};

export { EmbeddedStatus as default };
