import clsx from 'clsx';
import React, { Suspense } from 'react';
import StickyBox from 'react-sticky-box';

import { useFeatures } from 'pl-fe/hooks/use-features';

interface ISidebar {
  children: React.ReactNode;
}
interface IAside {
  children?: React.ReactNode;
}

interface ILayout {
  children: React.ReactNode;
}

interface LayoutComponent extends React.FC<ILayout> {
  Sidebar: React.FC<ISidebar>;
  Main: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Aside: React.FC<IAside>;
}

/** Layout container, to hold Sidebar, Main, and Aside. */
const Layout: LayoutComponent = ({ children }) => (
  <div className='relative flex grow flex-col black:pt-0 sm:pt-4'>
    <div className='mx-auto w-full max-w-3xl grow sm:px-6 md:grid md:max-w-7xl md:grid-cols-12 md:gap-8 md:px-8 xl:max-w-[1440px]'>
      {children}
    </div>
  </div>
);

/** Left sidebar container in the UI. */
const Sidebar: React.FC<ISidebar> = ({ children }) => (
  <div className='hidden lg:col-span-3 lg:block'>
    <StickyBox offsetTop={16} className='pb-4'>
      {children}
    </StickyBox>
  </div>
);

/** Center column container in the UI. */
const Main: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className }) => {
  const features = useFeatures();

  return (
    <main
      className={clsx({
        'md:col-span-12 lg:col-span-9 xl:col-span-6 pb-14 lg:pb-0 xl:pb-16 black:border-gray-800 lg:black:border-l xl:black:border-r': true,
        'xl:pb-16': features.chats,
      }, className)}
    >
      {children}
    </main>
  );
};

/** Right sidebar container in the UI. */
const Aside: React.FC<IAside> = ({ children }) => (
  <aside className='hidden xl:col-span-3 xl:block'>
    <StickyBox offsetTop={16} className='space-y-6 pb-12'>
      <Suspense>
        {children}
      </Suspense>
    </StickyBox>
  </aside>
);

Layout.Sidebar = Sidebar;
Layout.Main = Main;
Layout.Aside = Aside;

export { Layout as default };
