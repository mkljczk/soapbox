import React from 'react';

import LandingGradient from 'pl-fe/components/landing-gradient';
import Spinner from 'pl-fe/components/ui/spinner';

/** Fullscreen loading indicator. */
const LoadingScreen: React.FC = React.memo(() => (
  <div className='fixed h-screen w-screen'>
    <LandingGradient />

    <div className='d-screen fixed z-10 flex w-screen items-center justify-center'>
      <div className='p-4'>
        <Spinner size={40} withText={false} />
      </div>
    </div>
  </div>
));

export { LoadingScreen as default };
