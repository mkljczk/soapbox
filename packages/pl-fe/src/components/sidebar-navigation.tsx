import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useInteractionRequestsCount } from 'pl-fe/api/hooks/statuses/use-interaction-requests';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import { useStatContext } from 'pl-fe/contexts/stat-context';
import Search from 'pl-fe/features/search/components/search';
import ComposeButton from 'pl-fe/features/ui/components/compose-button';
import ProfileDropdown from 'pl-fe/features/ui/components/profile-dropdown';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useLogo } from 'pl-fe/hooks/use-logo';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { useRegistrationStatus } from 'pl-fe/hooks/use-registration-status';
import { useSettings } from 'pl-fe/hooks/use-settings';

import Account from './account';
import DropdownMenu, { Menu } from './dropdown-menu';
import SidebarNavigationLink from './sidebar-navigation-link';
import SiteLogo from './site-logo';

const messages = defineMessages({
  followRequests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  lists: { id: 'column.lists', defaultMessage: 'Lists' },
  events: { id: 'column.events', defaultMessage: 'Events' },
  profileDirectory: { id: 'navigation_bar.profile_directory', defaultMessage: 'Profile directory' },
  followedTags: { id: 'navigation_bar.followed_tags', defaultMessage: 'Followed hashtags' },
  developers: { id: 'navigation.developers', defaultMessage: 'Developers' },
  scheduledStatuses: { id: 'column.scheduled_statuses', defaultMessage: 'Scheduled posts' },
  drafts: { id: 'navigation.drafts', defaultMessage: 'Drafts' },
  conversations: { id: 'navigation.direct_messages', defaultMessage: 'Direct messages' },
  interactionRequests: { id: 'navigation.interaction_requests', defaultMessage: 'Interaction requests' },
});

/** Desktop sidebar with links to different views in the app. */
const SidebarNavigation = () => {
  const intl = useIntl();
  const { unreadChatsCount } = useStatContext();

  const instance = useInstance();
  const features = useFeatures();
  const { isDeveloper } = useSettings();
  const { account } = useOwnAccount();
  const { isOpen } = useRegistrationStatus();
  const logoSrc = useLogo();

  const notificationCount = useAppSelector((state) => state.notifications.unread);
  const followRequestsCount = useAppSelector((state) => state.user_lists.follow_requests.items.length);
  const interactionRequestsCount = useInteractionRequestsCount().data || 0;
  const dashboardCount = useAppSelector((state) => state.admin.openReports.length + state.admin.awaitingApproval.length);
  const scheduledStatusCount = useAppSelector((state) => state.scheduled_statuses.size);
  const draftCount = useAppSelector((state) => state.draft_statuses.size);

  const restrictUnauth = instance.pleroma.metadata.restrict_unauthenticated;

  const makeMenu = (): Menu => {
    const menu: Menu = [];

    if (account) {
      if (features.chats && features.conversations) {
        menu.push({
          to: '/conversations',
          text: intl.formatMessage(messages.conversations),
          icon: require('@fluentui/mail_24_regular.svg'),
        });
      }

      if (account.locked || followRequestsCount > 0) {
        menu.push({
          to: '/follow_requests',
          text: intl.formatMessage(messages.followRequests),
          icon: require('@fluentui/person_add_24_regular.svg'),
          count: followRequestsCount,
        });
      }

      if (interactionRequestsCount > 0) {
        menu.push({
          to: '/interaction_requests',
          text: intl.formatMessage(messages.interactionRequests),
          icon: require('@fluentui/arrow_reply_24_regular.svg'),
          count: interactionRequestsCount,
        });
      }

      if (features.bookmarks) {
        menu.push({
          to: '/bookmarks',
          text: intl.formatMessage(messages.bookmarks),
          icon: require('@fluentui/bookmark_multiple_24_regular.svg'),
        });
      }

      if (features.lists) {
        menu.push({
          to: '/lists',
          text: intl.formatMessage(messages.lists),
          icon: require('@fluentui/people_24_regular.svg'),
        });
      }

      if (features.events) {
        menu.push({
          to: '/events',
          text: intl.formatMessage(messages.events),
          icon: require('@fluentui/calendar_ltr_24_regular.svg'),
        });
      }

      if (features.profileDirectory) {
        menu.push({
          to: '/directory',
          text: intl.formatMessage(messages.profileDirectory),
          icon: require('@fluentui/book_contacts_24_regular.svg'),
        });
      }

      if (features.followedHashtagsList) {
        menu.push({
          to: '/followed_tags',
          text: intl.formatMessage(messages.followedTags),
          icon: require('@fluentui/number_symbol_24_regular.svg'),
        });
      }

      if (isDeveloper) {
        menu.push({
          to: '/developers',
          icon: require('@fluentui/code_24_regular.svg'),
          text: intl.formatMessage(messages.developers),
        });
      }

      if (scheduledStatusCount > 0) {
        menu.push({
          to: '/scheduled_statuses',
          icon: require('@fluentui/calendar_clock_24_regular.svg'),
          text: intl.formatMessage(messages.scheduledStatuses),
          count: scheduledStatusCount,
        });
      }

      if (draftCount > 0) {
        menu.push({
          to: '/draft_statuses',
          icon: require('@fluentui/drafts_24_regular.svg'),
          text: intl.formatMessage(messages.drafts),
          count: draftCount,
        });
      }
    }

    return menu;
  };

  const menu = makeMenu();

  return (
    <Stack space={4}>
      {logoSrc && (
        <SiteLogo className='h-12 w-auto cursor-pointer' />
      )}

      {account && (
        <Stack space={4}>
          <div className='relative flex items-center'>
            <ProfileDropdown account={account}>
              <Account
                account={account}
                action={<Icon src={require('@tabler/icons/outline/chevron-down.svg')} className='text-gray-600 hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-500' />}
                disabled
              />
            </ProfileDropdown>
          </div>
          <div className='block w-full max-w-xs'>
            <Search openInRoute autosuggest />
          </div>
        </Stack>
      )}

      <Stack space={1.5}>
        <SidebarNavigationLink
          to='/'
          icon={require('@fluentui/home_24_regular.svg')}
          activeIcon={require('@fluentui/home_24_filled.svg')}
          text={<FormattedMessage id='tabs_bar.home' defaultMessage='Home' />}
        />

        <SidebarNavigationLink
          to='/search'
          icon={require('@fluentui/search_24_regular.svg')}
          text={<FormattedMessage id='tabs_bar.search' defaultMessage='Search' />}
        />

        {account && (
          <>
            <SidebarNavigationLink
              to='/notifications'
              icon={require('@fluentui/alert_24_regular.svg')}
              activeIcon={require('@fluentui/alert_24_filled.svg')}
              count={notificationCount}
              text={<FormattedMessage id='tabs_bar.notifications' defaultMessage='Notifications' />}
            />

            {features.chats && (
              <SidebarNavigationLink
                to='/chats'
                icon={require('@fluentui/chat_24_regular.svg')}
                activeIcon={require('@fluentui/chat_24_filled.svg')}
                count={unreadChatsCount}
                countMax={9}
                text={<FormattedMessage id='navigation.chats' defaultMessage='Chats' />}
              />
            )}

            {!features.chats && features.conversations && (
              <SidebarNavigationLink
                to='/conversations'
                icon={require('@fluentui/mail_24_regular.svg')}
                activeIcon={require('@fluentui/mail_24_filled.svg')}
                text={<FormattedMessage id='navigation.direct_messages' defaultMessage='Direct messages' />}
              />
            )}

            {features.groups && (
              <SidebarNavigationLink
                to='/groups'
                icon={require('@fluentui/group_24_regular.svg')}
                activeIcon={require('@fluentui/group_24_filled.svg')}
                text={<FormattedMessage id='tabs_bar.groups' defaultMessage='Groups' />}
              />
            )}

            <SidebarNavigationLink
              to={`/@${account.acct}`}
              icon={require('@fluentui/person_24_regular.svg')}
              activeIcon={require('@fluentui/person_24_filled.svg')}
              text={<FormattedMessage id='tabs_bar.profile' defaultMessage='Profile' />}
            />

            <SidebarNavigationLink
              to='/settings'
              icon={require('@fluentui/settings_24_regular.svg')}
              activeIcon={require('@fluentui/settings_24_filled.svg')}
              text={<FormattedMessage id='tabs_bar.settings' defaultMessage='Settings' />}
            />

            {(account.is_admin || account.is_moderator) && (
              <SidebarNavigationLink
                to='/pl-fe/admin'
                icon={require('@tabler/icons/outline/dashboard.svg')}
                count={dashboardCount}
                text={<FormattedMessage id='tabs_bar.dashboard' defaultMessage='Dashboard' />}
              />
            )}
          </>
        )}

        {(features.publicTimeline) && (
          <>
            {(account || !restrictUnauth.timelines.local) && (
              <SidebarNavigationLink
                to='/timeline/local'
                icon={features.federating ? require('@tabler/icons/outline/affiliate.svg') : require('@tabler/icons/outline/world.svg')}
                activeIcon={features.federating ? require('@tabler/icons/filled/affiliate.svg') : undefined}
                text={features.federating ? <FormattedMessage id='tabs_bar.local' defaultMessage='Local' /> : <FormattedMessage id='tabs_bar.all' defaultMessage='All' />}
              />
            )}

            {(features.bubbleTimeline && (account || !restrictUnauth.timelines.bubble)) && (
              <SidebarNavigationLink
                to='/timeline/bubble'
                icon={require('@tabler/icons/outline/chart-bubble.svg')}
                activeIcon={require('@tabler/icons/filled/chart-bubble.svg')}
                text={<FormattedMessage id='tabs_bar.bubble' defaultMessage='Bubble' />}
              />
            )}

            {(features.federating && (account || !restrictUnauth.timelines.federated)) && (
              <SidebarNavigationLink
                to='/timeline/fediverse'
                icon={require('@tabler/icons/outline/topology-star-ring-3.svg')}
                text={<FormattedMessage id='tabs_bar.fediverse' defaultMessage='Fediverse' />}
              />
            )}
          </>
        )}

        {menu.length > 0 && (
          <DropdownMenu items={menu} placement='top'>
            <SidebarNavigationLink
              icon={require('@fluentui/more_horizontal_24_filled.svg')}
              text={<FormattedMessage id='tabs_bar.more' defaultMessage='More' />}
            />
          </DropdownMenu>
        )}

        {!account && (
          <Stack className='xl:hidden' space={1.5}>
            <SidebarNavigationLink
              to='/login'
              icon={require('@tabler/icons/outline/login.svg')}
              text={<FormattedMessage id='account.login' defaultMessage='Log in' />}
            />

            {isOpen && <SidebarNavigationLink
              to='/signup'
              icon={require('@fluentui/person_add_24_regular.svg')}
              text={<FormattedMessage id='account.register' defaultMessage='Sign up' />}
            />}
          </Stack>
        )}
      </Stack>

      {account && (
        <ComposeButton />
      )}
    </Stack>
  );
};

export { SidebarNavigation as default };
