import clsx from 'clsx';
import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { Redirect, Switch, useHistory, useLocation } from 'react-router-dom';

import { fetchConfig, fetchReports, fetchUsers } from 'pl-fe/actions/admin';
import { fetchCustomEmojis } from 'pl-fe/actions/custom-emojis';
import { fetchDraftStatuses } from 'pl-fe/actions/draft-statuses';
import { fetchFilters } from 'pl-fe/actions/filters';
import { fetchMarker } from 'pl-fe/actions/markers';
import { expandNotifications } from 'pl-fe/actions/notifications';
import { register as registerPushNotifications } from 'pl-fe/actions/push-notifications/registerer';
import { fetchScheduledStatuses } from 'pl-fe/actions/scheduled-statuses';
import { fetchHomeTimeline } from 'pl-fe/actions/timelines';
import { prefetchFollowRequests } from 'pl-fe/api/hooks/account-lists/use-follow-requests';
import { useUserStream } from 'pl-fe/api/hooks/streaming/use-user-stream';
import SidebarNavigation from 'pl-fe/components/sidebar-navigation';
import ThumbNavigation from 'pl-fe/components/thumb-navigation';
import Layout from 'pl-fe/components/ui/layout';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useClient } from 'pl-fe/hooks/use-client';
import { useDraggedFiles } from 'pl-fe/hooks/use-dragged-files';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';
import AdminLayout from 'pl-fe/layouts/admin-layout';
import ChatsLayout from 'pl-fe/layouts/chats-layout';
import DefaultLayout from 'pl-fe/layouts/default-layout';
import EmptyLayout from 'pl-fe/layouts/empty-layout';
import EventLayout from 'pl-fe/layouts/event-layout';
import EventsLayout from 'pl-fe/layouts/events-layout';
import ExternalLoginLayout from 'pl-fe/layouts/external-login-layout';
import GroupLayout from 'pl-fe/layouts/group-layout';
import GroupsLayout from 'pl-fe/layouts/groups-layout';
import HomeLayout from 'pl-fe/layouts/home-layout';
import LandingLayout from 'pl-fe/layouts/landing-layout';
import ManageGroupsLayout from 'pl-fe/layouts/manage-groups-layout';
import ProfileLayout from 'pl-fe/layouts/profile-layout';
import RemoteInstanceLayout from 'pl-fe/layouts/remote-instance-layout';
import SearchLayout from 'pl-fe/layouts/search-layout';
import StatusLayout from 'pl-fe/layouts/status-layout';
import { useUiStore } from 'pl-fe/stores/ui';
import { getVapidKey } from 'pl-fe/utils/auth';
import { isStandalone } from 'pl-fe/utils/state';

import BackgroundShapes from './components/background-shapes';
import {
  AboutPage,
  AccountGallery,
  AccountHoverCard,
  AccountTimeline,
  Aliases,
  Announcements,
  AuthTokenList,
  Backups,
  Blocks,
  BookmarkFolders,
  Bookmarks,
  BubbleTimeline,
  ChatIndex,
  ChatWidget,
  Circle,
  CommunityTimeline,
  ComposeEvent,
  Conversations,
  CreateApp,
  CryptoDonate,
  Dashboard,
  DeleteAccount,
  Developers,
  Directory,
  DomainBlocks,
  Domains,
  DraftStatuses,
  EditEmail,
  EditFilter,
  EditGroup,
  EditPassword,
  EditProfile,
  EventDiscussion,
  EventInformation,
  Events,
  ExportData,
  ExternalLogin,
  FavouritedStatuses,
  FederationRestrictions,
  Filters,
  FollowRecommendations,
  FollowRequests,
  FollowedTags,
  Followers,
  Following,
  GenericNotFound,
  GroupBlockedMembers,
  GroupGallery,
  GroupMembers,
  GroupMembershipRequests,
  GroupTimeline,
  Groups,
  HashtagTimeline,
  HomeTimeline,
  ImportData,
  IntentionalError,
  InteractionPolicies,
  InteractionRequests,
  LandingTimeline,
  ListTimeline,
  Lists,
  LoginPage,
  LogoutPage,
  ManageGroup,
  MfaForm,
  Migration,
  ModerationLog,
  Mutes,
  NewStatus,
  Notifications,
  PasswordReset,
  PinnedStatuses,
  PlFeConfig,
  PublicTimeline,
  Quotes,
  RegisterInvite,
  RegistrationPage,
  Relays,
  RemoteTimeline,
  Rules,
  ScheduledStatuses,
  Search,
  ServerInfo,
  ServiceWorkerInfo,
  Settings,
  SettingsStore,
  Share,
  SidebarMenu,
  Status,
  StatusHoverCard,
  TestTimeline,
  ThemeEditor,
  UserIndex,
} from './util/async-components';
import GlobalHotkeys from './util/global-hotkeys';
import { WrappedRoute } from './util/react-router-helpers';

// Dummy import, to make sure that <Status /> ends up in the application bundle.
// Without this it ends up in ~8 very commonly used bundles.
import 'pl-fe/components/status';

interface ISwitchingColumnsArea {
  children: React.ReactNode;
}

const SwitchingColumnsArea: React.FC<ISwitchingColumnsArea> = ({ children }) => {
  const instance = useInstance();
  const features = useFeatures();
  const { search } = useLocation();
  const { isLoggedIn } = useLoggedIn();
  const standalone = useAppSelector(isStandalone);

  const { authenticatedProfile, cryptoAddresses } = usePlFeConfig();
  const hasCrypto = cryptoAddresses.length > 0;

  // NOTE: Mastodon and Pleroma route some basenames to the backend.
  // When adding new routes, use a basename that does NOT conflict
  // with a known backend route, but DO redirect the backend route
  // to the corresponding component as a fallback.
  // Ex: use /login instead of /auth, but redirect /auth to /login
  return (
    <Switch>
      {standalone && <Redirect from='/' to='/login/external' exact />}

      <WrappedRoute path='/logout' layout={EmptyLayout} component={LogoutPage} publicRoute exact />

      {isLoggedIn ? (
        <WrappedRoute path='/' exact layout={HomeLayout} component={HomeTimeline} content={children} />
      ) : (
        <WrappedRoute path='/' exact layout={LandingLayout} component={LandingTimeline} content={children} publicRoute />
      )}

      {/*
        NOTE: we cannot nest routes in a fragment
        https://stackoverflow.com/a/68637108
      */}
      {features.federating && <WrappedRoute path='/timeline/local' exact layout={HomeLayout} component={CommunityTimeline} content={children} publicRoute />}
      {features.federating && <WrappedRoute path='/timeline/fediverse' exact layout={HomeLayout} component={PublicTimeline} content={children} publicRoute />}
      {features.bubbleTimeline && <WrappedRoute path='/timeline/bubble' exact layout={HomeLayout} component={BubbleTimeline} content={children} publicRoute />}
      {features.federating && <WrappedRoute path='/timeline/:instance' exact layout={RemoteInstanceLayout} component={RemoteTimeline} content={children} />}

      {features.conversations && <WrappedRoute path='/conversations' layout={DefaultLayout} component={Conversations} content={children} />}
      {features.conversations && <Redirect from='/messages' to='/conversations' />}

      {/* Mastodon web routes */}
      <Redirect from='/web/:path1/:path2/:path3' to='/:path1/:path2/:path3' />
      <Redirect from='/web/:path1/:path2' to='/:path1/:path2' />
      <Redirect from='/web/:path' to='/:path' />
      <Redirect from='/timelines/home' to='/' />
      <Redirect from='/timelines/public/local' to='/timeline/local' />
      <Redirect from='/timelines/public' to='/timeline/fediverse' />
      <Redirect from='/timelines/direct' to='/messages' />

      {/* Pleroma FE web routes */}
      <Redirect from='/main/all' to='/timeline/fediverse' />
      <Redirect from='/main/public' to='/timeline/local' />
      <Redirect from='/main/friends' to='/' />
      <Redirect from='/tag/:id' to='/tags/:id' />
      <Redirect from='/user-settings' to='/settings/profile' />
      <WrappedRoute path='/notice/:statusId' publicRoute exact layout={DefaultLayout} component={Status} content={children} />
      <Redirect from='/users/:username/statuses/:statusId' to='/@:username/posts/:statusId' />
      <Redirect from='/users/:username/chats' to='/chats' />
      <Redirect from='/users/:username' to='/@:username' />
      <Redirect from='/registration' to='/' exact />

      {/* Mastodon rendered pages */}
      <Redirect from='/admin' to='/pl-fe/admin' />
      <Redirect from='/terms' to='/about' />
      <Redirect from='/settings/preferences' to='/settings' />
      <Redirect from='/settings/two_factor_authentication_methods' to='/settings/mfa' />
      <Redirect from='/settings/otp_authentication' to='/settings/mfa' />
      <Redirect from='/settings/applications' to='/developers' />
      <Redirect from='/auth/edit' to='/settings' />
      <Redirect from='/auth/confirmation' to={`/email-confirmation${search}`} />
      <Redirect from='/auth/reset_password' to='/reset-password' />
      <Redirect from='/auth/edit_password' to='/edit-password' />
      <Redirect from='/auth/sign_in' to='/login' />
      <Redirect from='/auth/sign_out' to='/logout' />

      {/* Pleroma hard-coded email URLs */}
      <Redirect from='/registration/:token' to='/invite/:token' />

      <WrappedRoute path='/tags/:id' publicRoute layout={DefaultLayout} component={HashtagTimeline} content={children} />

      {features.lists && <WrappedRoute path='/lists' layout={DefaultLayout} component={Lists} content={children} />}
      {features.lists && <WrappedRoute path='/list/:id' layout={DefaultLayout} component={ListTimeline} content={children} />}
      {features.bookmarks && <WrappedRoute path='/bookmarks/all' layout={DefaultLayout} component={Bookmarks} content={children} />}
      {features.bookmarks && <WrappedRoute path='/bookmarks/:id' layout={DefaultLayout} component={Bookmarks} content={children} />}
      <WrappedRoute path='/bookmarks' layout={DefaultLayout} component={BookmarkFolders} content={children} />

      <WrappedRoute path='/notifications' layout={DefaultLayout} component={Notifications} content={children} />

      <WrappedRoute path='/search' layout={SearchLayout} component={Search} content={children} publicRoute />
      {features.suggestions && <WrappedRoute path='/suggestions' publicRoute layout={DefaultLayout} component={FollowRecommendations} content={children} />}
      {features.profileDirectory && <WrappedRoute path='/directory' publicRoute layout={DefaultLayout} component={Directory} content={children} />}
      {features.events && <WrappedRoute path='/events/new' layout={EventsLayout} component={ComposeEvent} content={children} />}
      {features.events && <WrappedRoute path='/events' layout={EventsLayout} component={Events} content={children} />}

      {features.chats && <WrappedRoute path='/chats' exact layout={ChatsLayout} component={ChatIndex} content={children} />}
      {features.chats && <WrappedRoute path='/chats/new' layout={ChatsLayout} component={ChatIndex} content={children} />}
      {features.chats && <WrappedRoute path='/chats/settings' layout={ChatsLayout} component={ChatIndex} content={children} />}
      {features.chats && <WrappedRoute path='/chats/:chatId' layout={ChatsLayout} component={ChatIndex} content={children} />}

      <WrappedRoute path='/follow_requests' layout={DefaultLayout} component={FollowRequests} content={children} />
      <WrappedRoute path='/blocks' layout={DefaultLayout} component={Blocks} content={children} />
      {features.federating && <WrappedRoute path='/domain_blocks' layout={DefaultLayout} component={DomainBlocks} content={children} />}
      <WrappedRoute path='/mutes' layout={DefaultLayout} component={Mutes} content={children} />
      {(features.filters || features.filtersV2) && <WrappedRoute path='/filters/new' layout={DefaultLayout} component={EditFilter} content={children} />}
      {(features.filters || features.filtersV2) && <WrappedRoute path='/filters/:id' layout={DefaultLayout} component={EditFilter} content={children} />}
      {(features.filters || features.filtersV2) && <WrappedRoute path='/filters' layout={DefaultLayout} component={Filters} content={children} />}
      {(features.followedHashtagsList) && <WrappedRoute path='/followed_tags' layout={DefaultLayout} component={FollowedTags} content={children} />}
      {features.interactionRequests && <WrappedRoute path='/interaction_requests' layout={DefaultLayout} component={InteractionRequests} content={children} />}
      <WrappedRoute path='/@:username' publicRoute exact layout={ProfileLayout} component={AccountTimeline} content={children} />
      <WrappedRoute path='/@:username/with_replies' publicRoute={!authenticatedProfile} layout={ProfileLayout} component={AccountTimeline} content={children} componentParams={{ withReplies: true }} />
      <WrappedRoute path='/@:username/followers' publicRoute={!authenticatedProfile} layout={ProfileLayout} component={Followers} content={children} />
      <WrappedRoute path='/@:username/following' publicRoute={!authenticatedProfile} layout={ProfileLayout} component={Following} content={children} />
      <WrappedRoute path='/@:username/media' publicRoute={!authenticatedProfile} layout={ProfileLayout} component={AccountGallery} content={children} />
      <WrappedRoute path='/@:username/tagged/:tag' exact layout={ProfileLayout} component={AccountTimeline} content={children} />
      <WrappedRoute path='/@:username/favorites' layout={ProfileLayout} component={FavouritedStatuses} content={children} />
      <WrappedRoute path='/@:username/pins' layout={ProfileLayout} component={PinnedStatuses} content={children} />
      <WrappedRoute path='/@:username/posts/:statusId' publicRoute exact layout={StatusLayout} component={Status} content={children} />
      <WrappedRoute path='/@:username/posts/:statusId/quotes' publicRoute layout={StatusLayout} component={Quotes} content={children} />
      {features.events && <WrappedRoute path='/@:username/events/:statusId' publicRoute exact layout={EventLayout} component={EventInformation} content={children} />}
      {features.events && <WrappedRoute path='/@:username/events/:statusId/edit' publicRoute exact layout={EventsLayout} component={ComposeEvent} content={children} />}
      {features.events && <WrappedRoute path='/@:username/events/:statusId/discussion' publicRoute exact layout={EventLayout} component={EventDiscussion} content={children} />}
      <Redirect from='/@:username/:statusId' to='/@:username/posts/:statusId' />
      <WrappedRoute path='/posts/:statusId' publicRoute exact layout={DefaultLayout} component={Status} content={children} />

      {features.groups && <WrappedRoute path='/groups' exact layout={GroupsLayout} component={Groups} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:groupId' exact layout={GroupLayout} component={GroupTimeline} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:groupId/members' exact layout={GroupLayout} component={GroupMembers} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:groupId/media' publicRoute={!authenticatedProfile} layout={GroupLayout} component={GroupGallery} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:groupId/manage' exact layout={ManageGroupsLayout} component={ManageGroup} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:groupId/manage/edit' exact layout={ManageGroupsLayout} component={EditGroup} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:groupId/manage/blocks' exact layout={ManageGroupsLayout} component={GroupBlockedMembers} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:groupId/manage/requests' exact layout={ManageGroupsLayout} component={GroupMembershipRequests} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:groupId/posts/:statusId' exact layout={StatusLayout} component={Status} content={children} />}

      <WrappedRoute path='/statuses/new' layout={DefaultLayout} component={NewStatus} content={children} exact />
      <WrappedRoute path='/statuses/:statusId' exact layout={StatusLayout} component={Status} content={children} />
      {features.scheduledStatuses && <WrappedRoute path='/scheduled_statuses' layout={DefaultLayout} component={ScheduledStatuses} content={children} />}
      <WrappedRoute path='/draft_statuses' layout={DefaultLayout} component={DraftStatuses} content={children} />

      <WrappedRoute path='/circle' layout={DefaultLayout} component={Circle} content={children} />

      <WrappedRoute path='/settings/profile' layout={DefaultLayout} component={EditProfile} content={children} />
      {features.exportData && <WrappedRoute path='/settings/export' layout={DefaultLayout} component={ExportData} content={children} />}
      {(features.importBlocks || features.importFollows || features.importMutes) && <WrappedRoute path='/settings/import' layout={DefaultLayout} component={ImportData} content={children} />}
      {features.manageAccountAliases && <WrappedRoute path='/settings/aliases' layout={DefaultLayout} component={Aliases} content={children} />}
      {features.accountMoving && <WrappedRoute path='/settings/migration' layout={DefaultLayout} component={Migration} content={children} />}
      {features.accountBackups && <WrappedRoute path='/settings/backups' layout={DefaultLayout} component={Backups} content={children} />}
      <WrappedRoute path='/settings/email' layout={DefaultLayout} component={EditEmail} content={children} />
      <WrappedRoute path='/settings/password' layout={DefaultLayout} component={EditPassword} content={children} />
      <WrappedRoute path='/settings/account' layout={DefaultLayout} component={DeleteAccount} content={children} />
      <WrappedRoute path='/settings/mfa' layout={DefaultLayout} component={MfaForm} exact />
      <WrappedRoute path='/settings/tokens' layout={DefaultLayout} component={AuthTokenList} content={children} />
      {features.interactionRequests && <WrappedRoute path='/settings/interaction_policies' layout={DefaultLayout} component={InteractionPolicies} content={children} />}
      <WrappedRoute path='/settings' layout={DefaultLayout} component={Settings} content={children} />
      <WrappedRoute path='/pl-fe/config' adminOnly layout={DefaultLayout} component={PlFeConfig} content={children} />

      <WrappedRoute path='/pl-fe/admin' staffOnly layout={AdminLayout} component={Dashboard} content={children} exact />
      <WrappedRoute path='/pl-fe/admin/approval' staffOnly layout={AdminLayout} component={Dashboard} content={children} exact />
      <WrappedRoute path='/pl-fe/admin/reports' staffOnly layout={AdminLayout} component={Dashboard} content={children} exact />
      <WrappedRoute path='/pl-fe/admin/log' staffOnly layout={AdminLayout} component={ModerationLog} content={children} exact />
      <WrappedRoute path='/pl-fe/admin/users' staffOnly layout={AdminLayout} component={UserIndex} content={children} exact />
      <WrappedRoute path='/pl-fe/admin/theme' staffOnly layout={AdminLayout} component={ThemeEditor} content={children} exact />
      <WrappedRoute path='/pl-fe/admin/relays' staffOnly layout={AdminLayout} component={Relays} content={children} exact />
      {features.pleromaAdminAnnouncements && <WrappedRoute path='/pl-fe/admin/announcements' staffOnly layout={AdminLayout} component={Announcements} content={children} exact />}
      {features.domains && <WrappedRoute path='/pl-fe/admin/domains' staffOnly layout={AdminLayout} component={Domains} content={children} exact />}
      {features.pleromaAdminRules && <WrappedRoute path='/pl-fe/admin/rules' staffOnly layout={AdminLayout} component={Rules} content={children} exact />}
      <WrappedRoute path='/info' layout={EmptyLayout} component={ServerInfo} content={children} />

      <WrappedRoute path='/developers/apps/create' developerOnly layout={DefaultLayout} component={CreateApp} content={children} />
      <WrappedRoute path='/developers/settings_store' developerOnly layout={DefaultLayout} component={SettingsStore} content={children} />
      <WrappedRoute path='/developers/timeline' developerOnly layout={DefaultLayout} component={TestTimeline} content={children} />
      <WrappedRoute path='/developers/sw' developerOnly layout={DefaultLayout} component={ServiceWorkerInfo} content={children} />
      <WrappedRoute path='/developers' layout={DefaultLayout} component={Developers} content={children} />
      <WrappedRoute path='/error/network' developerOnly layout={EmptyLayout} component={lazy(() => Promise.reject(new TypeError('Failed to fetch dynamically imported module: TEST')))} content={children} />
      <WrappedRoute path='/error' developerOnly layout={EmptyLayout} component={IntentionalError} content={children} />

      {hasCrypto && <WrappedRoute path='/donate/crypto' publicRoute layout={DefaultLayout} component={CryptoDonate} content={children} />}
      {features.federating && <WrappedRoute path='/federation_restrictions' publicRoute layout={DefaultLayout} component={FederationRestrictions} content={children} />}

      <WrappedRoute path='/share' layout={DefaultLayout} component={Share} content={children} exact />

      <WrappedRoute path='/about/:slug?' layout={DefaultLayout} component={AboutPage} publicRoute exact />

      {(features.accountCreation && instance.registrations.enabled) && (
        <WrappedRoute path='/signup' layout={EmptyLayout} component={RegistrationPage} publicRoute exact />
      )}

      <WrappedRoute path='/login/external' layout={ExternalLoginLayout} component={ExternalLogin} publicRoute exact />
      <WrappedRoute path='/login/add' layout={DefaultLayout} component={LoginPage} publicRoute exact />
      <WrappedRoute path='/login' layout={DefaultLayout} component={LoginPage} publicRoute exact />
      <WrappedRoute path='/reset-password' layout={DefaultLayout} component={PasswordReset} publicRoute exact />
      <WrappedRoute path='/invite/:token' layout={DefaultLayout} component={RegisterInvite} publicRoute exact />
      <Redirect from='/auth/password/new' to='/reset-password' />
      <Redirect from='/auth/password/edit' to={`/edit-password${search}`} />

      <WrappedRoute layout={EmptyLayout} component={GenericNotFound} content={children} />
    </Switch>
  );
};

interface IUI {
  children?: React.ReactNode;
}

const UI: React.FC<IUI> = ({ children }) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const node = useRef<HTMLDivElement | null>(null);
  const me = useAppSelector(state => state.me);
  const { account } = useOwnAccount();
  const features = useFeatures();
  const vapidKey = useAppSelector(state => getVapidKey(state));
  const client = useClient();

  const { isDropdownMenuOpen } = useUiStore();
  const standalone = useAppSelector(isStandalone);

  const { isDragging } = useDraggedFiles(node);

  const handleServiceWorkerPostMessage = ({ data }: MessageEvent) => {
    if (data.type === 'navigate') {
      history.push(data.path);
    } else {
      console.warn('Unknown message type:', data.type);
    }
  };

  const handleDragEnter = (e: DragEvent) => e.preventDefault();
  const handleDragLeave = (e: DragEvent) => e.preventDefault();
  const handleDragOver = (e: DragEvent) => e.preventDefault();
  const handleDrop = (e: DragEvent) => e.preventDefault();

  /** Load initial data when a user is logged in */
  const loadAccountData = () => {
    if (!account) return;

    dispatch(fetchDraftStatuses());

    dispatch(fetchHomeTimeline());

    dispatch(expandNotifications())
      // @ts-ignore
      .then(() => dispatch(fetchMarker(['notifications'])))
      .catch(console.error);

    if (account.is_admin || account.is_moderator) {
      dispatch(fetchReports({ resolved: false }));
      dispatch(fetchUsers({
        origin: 'local',
        status: 'pending',
      }));
    }

    if (account.is_admin) {
      dispatch(fetchConfig());
    }

    setTimeout(() => dispatch(fetchFilters()), 500);

    if (account.locked) {
      setTimeout(() => prefetchFollowRequests(client), 700);
    }

    setTimeout(() => dispatch(fetchScheduledStatuses()), 900);
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerPostMessage);
    }

    if (window.Notification?.permission === 'default') {
      window.setTimeout(() => Notification.requestPermission(), 120 * 1000);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  useUserStream();

  // The user has logged in
  useEffect(() => {
    loadAccountData();
    dispatch(fetchCustomEmojis());
  }, [!!account]);

  useEffect(() => {
    dispatch(registerPushNotifications());
  }, [vapidKey]);

  // Wait for login to succeed or fail
  if (me === null) return null;

  const style: React.CSSProperties = {
    pointerEvents: isDropdownMenuOpen ? 'none' : undefined,
  };

  return (
    <GlobalHotkeys node={node}>
      <div ref={node} style={style}>
        <div
          className={clsx('pointer-events-none fixed z-[90] h-screen w-screen transition', {
            'backdrop-blur': isDragging,
          })}
        />

        <BackgroundShapes />

        <div className='z-10 flex min-h-screen flex-col'>
          <Layout>
            <Layout.Sidebar>
              {!standalone && <SidebarNavigation />}
            </Layout.Sidebar>

            <SwitchingColumnsArea>
              {children}
            </SwitchingColumnsArea>
          </Layout>

          <Suspense>
            <SidebarMenu />
          </Suspense>

          {me && features.chats && (
            <div className='hidden xl:block'>
              <Suspense fallback={<div className='fixed bottom-0 z-[99] flex h-16 w-96 animate-pulse flex-col rounded-t-lg bg-white shadow-3xl dark:bg-gray-900 ltr:right-5 rtl:left-5' />}>
                <ChatWidget />
              </Suspense>
            </div>
          )}

          <ThumbNavigation />

          <Suspense>
            <AccountHoverCard />
          </Suspense>

          <Suspense>
            <StatusHoverCard />
          </Suspense>
        </div>
      </div>
    </GlobalHotkeys>
  );
};

export { UI as default };
