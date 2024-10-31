import React, { Suspense, useEffect, useRef } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Redirect, Route, useHistory, RouteProps, RouteComponentProps, match as MatchType, useLocation } from 'react-router-dom';

import Layout from 'pl-fe/components/ui/layout';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { useSettings } from 'pl-fe/hooks/use-settings';

import ColumnForbidden from '../components/column-forbidden';
import ColumnLoading from '../components/column-loading';
import ErrorColumn from '../components/error-column';

type LayoutProps = {
  params?: MatchType['params'];
  children: React.ReactNode;
};

interface IWrappedRoute extends RouteProps {
  component: React.ExoticComponent<any>;
  layout: React.ComponentType<LayoutProps>;
  content?: React.ReactNode;
  componentParams?: Record<string, any>;
  publicRoute?: boolean;
  staffOnly?: boolean;
  adminOnly?: boolean;
  developerOnly?: boolean;
}

const WrappedRoute: React.FC<IWrappedRoute> = ({
  component: Component,
  layout: Layout,
  content,
  componentParams = {},
  publicRoute = false,
  staffOnly = false,
  adminOnly = false,
  developerOnly = false,
  ...rest
}) => {
  const history = useHistory();

  const { account } = useOwnAccount();
  const { isDeveloper } = useSettings();

  const renderComponent = ({ match }: RouteComponentProps) => (
    <ErrorBoundary FallbackComponent={FallbackError}>
      <Suspense fallback={<FallbackLoading />}>
        <Layout params={match.params} {...componentParams}>
          <Component params={match.params} {...componentParams}>
            {content}
          </Component>
        </Layout>
      </Suspense>
    </ErrorBoundary>
  );

  const loginRedirect = () => {
    const actualUrl = encodeURIComponent(`${history.location.pathname}${history.location.search}`);
    localStorage.setItem('plfe:redirect_uri', actualUrl);
    return <Redirect to='/login' />;
  };

  const authorized = [
    account || publicRoute,
    developerOnly ? isDeveloper : true,
    staffOnly ? account && (account.is_admin || account.is_moderator) : true,
    adminOnly ? account && account.is_admin : true,
  ].every(c => c);

  if (!authorized) {
    if (!account) {
      return loginRedirect();
    } else {
      return <FallbackForbidden />;
    }
  }

  return <Route {...rest} render={renderComponent} />;
};

interface IFallbackLayout {
  children: JSX.Element;
}

const FallbackLayout: React.FC<IFallbackLayout> = ({ children }) => (
  <>
    <Layout.Main>
      {children}
    </Layout.Main>

    <Layout.Aside />
  </>
);

const FallbackLoading: React.FC = () => (
  <FallbackLayout>
    <ColumnLoading />
  </FallbackLayout>
);

const FallbackForbidden: React.FC = () => (
  <FallbackLayout>
    <ColumnForbidden />
  </FallbackLayout>
);

const FallbackError: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const location = useLocation();
  const firstUpdate = useRef(true);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
    } else {
      resetErrorBoundary();
    }
  }, [location]);

  return (
    <FallbackLayout>
      <ErrorColumn error={error} onRetry={resetErrorBoundary} />
    </FallbackLayout>
  );
};

export {
  WrappedRoute,
};
