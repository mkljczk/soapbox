import { RouterProvider } from '@tanstack/react-router';
import React, { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import { CompatRouter } from 'react-router-dom-v5-compat';
// @ts-ignore: it doesn't have types
import { ScrollContext } from 'react-router-scroll-4';

import * as BuildConfig from 'pl-fe/build-config';
import LoadingScreen from 'pl-fe/components/loading-screen';
import SiteErrorBoundary from 'pl-fe/components/site-error-boundary';
import { useRouter } from 'pl-fe/features/ui';
import { ModalRoot, OnboardingWizard } from 'pl-fe/features/ui/util/async-components';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';
import { useCachedLocationHandler } from 'pl-fe/utils/redirect';

const GdprBanner = React.lazy(() => import('pl-fe/components/gdpr-banner'));
// const EmbeddedStatus = React.lazy(() => import('pl-fe/features/embedded-status'));

/** Highest level node with the Redux store. */
const PlFeMount = () => {
  useCachedLocationHandler();

  const { isLoggedIn } = useLoggedIn();
  const { account } = useOwnAccount();
  const plFeConfig = usePlFeConfig();
  const router = useRouter();

  const needsOnboarding = useAppSelector(state => state.onboarding.needsOnboarding);
  const showOnboarding = account && needsOnboarding;
  const { gdpr } = plFeConfig;

  // @ts-ignore: I don't actually know what these should be, lol
  const shouldUpdateScroll = (prevRouterProps, { location }) =>
    !(location.state?.plFeModalKey && location.state?.plFeModalKey !== prevRouterProps?.location?.state?.plFeModalKey)
    && !(location.state?.plFeDropdownKey && location.state?.plFeDropdownKey !== prevRouterProps?.location?.state?.plFeDropdownKey);

  return (
    <SiteErrorBoundary>
      <BrowserRouter basename={BuildConfig.FE_SUBDIRECTORY}>
        <CompatRouter>
          <ScrollContext shouldUpdateScroll={shouldUpdateScroll}>
            <>
              <Suspense fallback={<LoadingScreen />}>
                {showOnboarding
                  ? <OnboardingWizard />
                  : <RouterProvider router={router} />
                }
              </Suspense>

              <Suspense>
                <ModalRoot />
              </Suspense>

              {(gdpr && !isLoggedIn) && (
                <Suspense>
                  <GdprBanner />
                </Suspense>
              )}

              <div id='toaster'>
                <Toaster
                  position='top-right'
                  containerClassName='top-4'
                />
              </div>
            </>
            {/* <Switch>
              <Route
                path='/embed/:statusId'
                render={(props) => (
                  <Suspense>
                    <EmbeddedStatus params={props.match.params} />
                  </Suspense>
                )}
              />

              <Redirect from='/@:username/:statusId/embed' to='/embed/:statusId' />
            </Switch> */}
          </ScrollContext>
        </CompatRouter>
      </BrowserRouter>
    </SiteErrorBoundary>
  );
};

export { PlFeMount as default };
