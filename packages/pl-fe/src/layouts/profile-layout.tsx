import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';
import { Redirect, useHistory } from 'react-router-dom';

import { useAccountLookup } from 'pl-fe/api/hooks/accounts/use-account-lookup';
import Column from 'pl-fe/components/ui/column';
import Layout from 'pl-fe/components/ui/layout';
import Tabs from 'pl-fe/components/ui/tabs';
import Header from 'pl-fe/features/account/components/header';
import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import {
  WhoToFollowPanel,
  ProfileInfoPanel,
  ProfileMediaPanel,
  ProfileFieldsPanel,
  SignUpPanel,
  PinnedAccountsPanel,
  AccountNotePanel,
} from 'pl-fe/features/ui/util/async-components';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';
import { getAcct } from 'pl-fe/utils/accounts';

interface IProfileLayout {
  params?: {
    username?: string;
  };
  children: React.ReactNode;
}

/** Layout to display a user's profile. */
const ProfileLayout: React.FC<IProfileLayout> = ({ params, children }) => {
  const history = useHistory();
  const username = params?.username || '';

  const { account } = useAccountLookup(username, { withRelationship: true });

  const me = useAppSelector(state => state.me);
  const features = useFeatures();
  const { displayFqn } = usePlFeConfig();

  // Fix case of username
  if (account && account.acct !== username) {
    return <Redirect to={`/@${account.acct}`} />;
  }

  const tabItems = [
    {
      text: <FormattedMessage id='account.posts' defaultMessage='Posts' />,
      to: `/@${username}`,
      name: 'profile',
    },
    {
      text: <FormattedMessage id='account.posts_with_replies' defaultMessage='Posts & replies' />,
      to: `/@${username}/with_replies`,
      name: 'replies',
    },
    {
      text: <FormattedMessage id='account.media' defaultMessage='Media' />,
      to: `/@${username}/media`,
      name: 'media',
    },
  ];

  if (account) {
    const ownAccount = account.id === me;
    if (ownAccount || account.hide_favorites === false) {
      tabItems.push({
        text: <FormattedMessage id='navigation_bar.favourites' defaultMessage='Likes' />,
        to: `/@${account.acct}/favorites`,
        name: 'likes',
      });
    }
  }

  let activeItem;
  const pathname = history.location.pathname.replace(`@${username}/`, '');
  if (pathname.endsWith('/with_replies')) {
    activeItem = 'replies';
  } else if (pathname.endsWith('/media')) {
    activeItem = 'media';
  } else if (pathname.endsWith('/favorites')) {
    activeItem = 'likes';
  } else {
    activeItem = 'profile';
  }

  const showTabs = !['/following', '/followers', '/pins'].some(path => pathname.endsWith(path));

  return (
    <>
      {account?.local === false && (
        <Helmet>
          <meta content='noindex, noarchive' name='robots' />
        </Helmet>
      )}
      <Layout.Main>
        <Column size='lg' label={account ? `@${getAcct(account, displayFqn)}` : ''} withHeader={false}>
          <div className='space-y-4'>
            <Header key={`profile-header-${account?.id}`} account={account} />
            <ProfileInfoPanel username={username} account={account} />

            {account && showTabs && (
              <Tabs key={`profile-tabs-${account.id}`} items={tabItems} activeItem={activeItem} />
            )}

            {children}
          </div>
        </Column>
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
        )}

        {features.notes && account && account?.id !== me && (
          <AccountNotePanel account={account} />
        )}
        <ProfileMediaPanel account={account} />
        {(account && account.fields.length > 0) && (
          <ProfileFieldsPanel account={account} />
        )}
        {(features.accountEndorsements && account && account.local) ? (
          <PinnedAccountsPanel account={account} limit={5} />
        ) : me && features.suggestions && (
          <WhoToFollowPanel limit={3} />
        )}
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export { ProfileLayout as default };
