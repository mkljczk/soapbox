import { useMutation } from '@tanstack/react-query';
import { GOTOSOCIAL, MASTODON, mediaAttachmentSchema } from 'pl-api';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import * as v from 'valibot';

import { biteAccount, blockAccount, pinAccount, removeFromFollowers, unblockAccount, unmuteAccount, unpinAccount } from 'pl-fe/actions/accounts';
import { mentionCompose, directCompose } from 'pl-fe/actions/compose';
import { blockDomain, unblockDomain } from 'pl-fe/actions/domain-blocks';
import { initMuteModal } from 'pl-fe/actions/mutes';
import { initReport, ReportableEntities } from 'pl-fe/actions/reports';
import { setSearchAccount } from 'pl-fe/actions/search';
import { useFollow } from 'pl-fe/api/hooks/accounts/use-follow';
import Badge from 'pl-fe/components/badge';
import DropdownMenu, { Menu } from 'pl-fe/components/dropdown-menu';
import StillImage from 'pl-fe/components/still-image';
import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import IconButton from 'pl-fe/components/ui/icon-button';
import VerificationBadge from 'pl-fe/components/verification-badge';
import MovedNote from 'pl-fe/features/account-timeline/components/moved-note';
import ActionButton from 'pl-fe/features/ui/components/action-button';
import SubscriptionButton from 'pl-fe/features/ui/components/subscription-button';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { useChats } from 'pl-fe/queries/chats';
import { queryClient } from 'pl-fe/queries/client';
import { useModalsStore } from 'pl-fe/stores/modals';
import { useSettingsStore } from 'pl-fe/stores/settings';
import toast from 'pl-fe/toast';
import { isDefaultHeader } from 'pl-fe/utils/accounts';
import copy from 'pl-fe/utils/copy';

import type { PlfeResponse } from 'pl-fe/api';
import type { Account } from 'pl-fe/normalizers/account';

const messages = defineMessages({
  edit_profile: { id: 'account.edit_profile', defaultMessage: 'Edit profile' },
  linkVerifiedOn: { id: 'account.link_verified_on', defaultMessage: 'Ownership of this link was checked on {date}' },
  account_locked: { id: 'account.locked_info', defaultMessage: 'This account privacy status is set to locked. The owner manually reviews who can follow them.' },
  mention: { id: 'account.mention', defaultMessage: 'Mention' },
  chat: { id: 'account.chat', defaultMessage: 'Chat with @{name}' },
  direct: { id: 'account.direct', defaultMessage: 'Direct message @{name}' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  report: { id: 'account.report', defaultMessage: 'Report @{name}' },
  copy: { id: 'account.copy', defaultMessage: 'Copy link to profile' },
  share: { id: 'account.share', defaultMessage: 'Share @{name}\'s profile' },
  media: { id: 'account.media', defaultMessage: 'Media' },
  blockDomain: { id: 'account.block_domain', defaultMessage: 'Hide everything from {domain}' },
  unblockDomain: { id: 'account.unblock_domain', defaultMessage: 'Unhide {domain}' },
  hideReblogs: { id: 'account.hide_reblogs', defaultMessage: 'Hide reposts from @{name}' },
  showReblogs: { id: 'account.show_reblogs', defaultMessage: 'Show reposts from @{name}' },
  preferences: { id: 'navigation_bar.preferences', defaultMessage: 'Preferences' },
  follow_requests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
  blocks: { id: 'navigation_bar.blocks', defaultMessage: 'Blocks' },
  domain_blocks: { id: 'navigation_bar.domain_blocks', defaultMessage: 'Domain blocks' },
  mutes: { id: 'navigation_bar.mutes', defaultMessage: 'Mutes' },
  endorse: { id: 'account.endorse', defaultMessage: 'Feature on profile' },
  unendorse: { id: 'account.unendorse', defaultMessage: 'Don\'t feature on profile' },
  bite: { id: 'account.bite', defaultMessage: 'Bite @{name}' },
  removeFromFollowers: { id: 'account.remove_from_followers', defaultMessage: 'Remove this follower' },
  adminAccount: { id: 'status.admin_account', defaultMessage: 'Moderate @{name}' },
  add_or_remove_from_list: { id: 'account.add_or_remove_from_list', defaultMessage: 'Add or Remove from lists' },
  search: { id: 'account.search', defaultMessage: 'Search from @{name}' },
  searchSelf: { id: 'account.search_self', defaultMessage: 'Search your posts' },
  unfollowConfirm: { id: 'confirmations.unfollow.confirm', defaultMessage: 'Unfollow' },
  blockConfirm: { id: 'confirmations.block.confirm', defaultMessage: 'Block' },
  blockDomainConfirm: { id: 'confirmations.domain_block.confirm', defaultMessage: 'Hide entire domain' },
  blockAndReport: { id: 'confirmations.block.block_and_report', defaultMessage: 'Block and report' },
  removeFromFollowersConfirm: { id: 'confirmations.remove_from_followers.confirm', defaultMessage: 'Remove' },
  userEndorsed: { id: 'account.endorse.success', defaultMessage: 'You are now featuring @{acct} on your profile' },
  userUnendorsed: { id: 'account.unendorse.success', defaultMessage: 'You are no longer featuring @{acct}' },
  userBit: { id: 'account.bite.success', defaultMessage: 'You have bit @{acct}' },
  userBiteFail: { id: 'account.bite.fail', defaultMessage: 'Failed to bite @{acct}' },
  profileExternal: { id: 'account.profile_external', defaultMessage: 'View profile on {domain}' },
  header: { id: 'account.header.alt', defaultMessage: 'Profile header' },
  subscribeFeed: { id: 'account.rss_feed', defaultMessage: 'Subscribe to RSS feed' },
});

interface IHeader {
  account?: Account;
}

const Header: React.FC<IHeader> = ({ account }) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const features = useFeatures();
  const { account: ownAccount } = useOwnAccount();
  const { follow } = useFollow();
  const { openModal } = useModalsStore();
  const { settings } = useSettingsStore();

  const { software } = useAppSelector((state) => state.auth.client.features.version);

  const { getOrCreateChatByAccountId } = useChats();

  const createAndNavigateToChat = useMutation({
    mutationFn: (accountId: string) => getOrCreateChatByAccountId(accountId),
    onError: (error: { response: PlfeResponse }) => {
      const data = error.response?.json as any;
      toast.error(data?.error);
    },
    onSuccess: (response) => {
      history.push(`/chats/${response.id}`);
      queryClient.invalidateQueries({
        queryKey: ['chats', 'search'],
      });
    },
  });

  if (!account) {
    return (
      <div className='-mx-4 -mt-4 sm:-mx-6 sm:-mt-6'>
        <div>
          <div className='relative h-32 w-full bg-gray-200 black:rounded-t-none dark:bg-gray-900/50 md:rounded-t-xl lg:h-48' />
        </div>

        <div className='px-4 sm:px-6'>
          <HStack alignItems='bottom' space={5} className='-mt-12'>
            <div className='relative flex'>
              <div
                className='size-24 rounded-full bg-gray-400 ring-4 ring-white dark:ring-gray-800'
              />
            </div>
          </HStack>
        </div>
      </div>
    );
  }

  const onBlock = () => {
    if (account.relationship?.blocking) {
      dispatch(unblockAccount(account.id));
    } else {
      openModal('CONFIRM', {
        heading: <FormattedMessage id='confirmations.block.heading' defaultMessage='Block @{name}' values={{ name: account.acct }} />,
        message: <FormattedMessage id='confirmations.block.message' defaultMessage='Are you sure you want to block {name}?' values={{ name: <strong className='break-words'>@{account.acct}</strong> }} />,
        confirm: intl.formatMessage(messages.blockConfirm),
        onConfirm: () => dispatch(blockAccount(account.id)),
        secondary: intl.formatMessage(messages.blockAndReport),
        onSecondary: () => {
          dispatch(blockAccount(account.id));
          dispatch(initReport(ReportableEntities.ACCOUNT, account));
        },
      });
    }
  };

  const onMention = () => {
    dispatch(mentionCompose(account));
  };

  const onDirect = () => {
    dispatch(directCompose(account));
  };

  const onReblogToggle = () => {
    if (account.relationship?.showing_reblogs) {
      follow(account.id, { reblogs: false });
    } else {
      follow(account.id, { reblogs: true });
    }
  };

  const onEndorseToggle = () => {
    if (account.relationship?.endorsed) {
      dispatch(unpinAccount(account.id))
        .then(() => toast.success(intl.formatMessage(messages.userUnendorsed, { acct: account.acct })))
        .catch(() => { });
    } else {
      dispatch(pinAccount(account.id))
        .then(() => toast.success(intl.formatMessage(messages.userEndorsed, { acct: account.acct })))
        .catch(() => { });
    }
  };

  const onBite = () => {
    dispatch(biteAccount(account.id))
      .then(() => toast.success(intl.formatMessage(messages.userBit, { acct: account.acct })))
      .catch(() => toast.error(intl.formatMessage(messages.userBiteFail, { acct: account.acct })));
  };

  const onReport = () => {
    dispatch(initReport(ReportableEntities.ACCOUNT, account));
  };

  const onMute = () => {
    if (account.relationship?.muting) {
      dispatch(unmuteAccount(account.id));
    } else {
      dispatch(initMuteModal(account));
    }
  };

  const onBlockDomain = (domain: string) => {
    openModal('CONFIRM', {
      heading: <FormattedMessage id='confirmations.domain_block.heading' defaultMessage='Block {domain}' values={{ domain }} />,
      message: <FormattedMessage id='confirmations.domain_block.message' defaultMessage='Are you really, really sure you want to block the entire {domain}? In most cases a few targeted blocks or mutes are sufficient and preferable. You will not see content from that domain in any public timelines or your notifications.' values={{ domain: <strong>{domain}</strong> }} />,
      confirm: intl.formatMessage(messages.blockDomainConfirm),
      onConfirm: () => dispatch(blockDomain(domain)),
    });
  };

  const onUnblockDomain = (domain: string) => {
    dispatch(unblockDomain(domain));
  };

  const onProfileExternal = (url: string) => {
    window.open(url, '_blank');
  };

  const onAddToList = () => {
    openModal('LIST_ADDER', {
      accountId: account.id,
    });
  };

  const onModerate = () => {
    openModal('ACCOUNT_MODERATION', { accountId: account.id });
  };

  const onRemoveFromFollowers = () => {
    const unfollowModal = settings.unfollowModal;
    if (unfollowModal) {
      openModal('CONFIRM', {
        heading: <FormattedMessage id='confirmations.remove_from_followers.heading' defaultMessage='Remove {name} from followers' values={{ name: <strong className='break-words'>@{account.acct}</strong> }} />,
        message: <FormattedMessage id='confirmations.remove_from_followers.message' defaultMessage='Are you sure you want to remove {name} from your followers?' values={{ name: <strong className='break-words'>@{account.acct}</strong> }} />,
        confirm: intl.formatMessage(messages.removeFromFollowersConfirm),
        onConfirm: () => dispatch(removeFromFollowers(account.id)),
      });
    } else {
      dispatch(removeFromFollowers(account.id));
    }
  };

  const onSearch = () => {
    dispatch(setSearchAccount(account.id));
    history.push('/search');
  };

  const onAvatarClick = () => {
    const avatar = v.parse(mediaAttachmentSchema, {
      id: '',
      type: 'image',
      url: account.avatar,
    });
    openModal('MEDIA', { media: [avatar], index: 0 });
  };

  const handleAvatarClick: React.MouseEventHandler = (e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onAvatarClick();
    }
  };

  const onHeaderClick = () => {
    const header = v.parse(mediaAttachmentSchema, {
      type: 'image',
      url: account.header,
    });
    openModal('MEDIA', { media: [header], index: 0 });
  };

  const handleHeaderClick: React.MouseEventHandler = (e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onHeaderClick();
    }
  };

  const handleShare = () => {
    navigator.share({
      text: `@${account.acct}`,
      url: account.url,
    }).catch((e) => {
      if (e.name !== 'AbortError') console.error(e);
    });
  };

  const handleCopy: React.EventHandler<React.MouseEvent> = (e) => {
    copy(account.url);
  };

  const makeMenu = () => {
    const menu: Menu = [];

    if (!account) {
      return [];
    }

    if (features.rssFeeds && account.local && (software !== GOTOSOCIAL || account.enable_rss)) {
      menu.push({
        text: intl.formatMessage(messages.subscribeFeed),
        icon: require('@tabler/icons/outline/rss.svg'),
        href: software === MASTODON ? `${account.url}.rss` : `${account.url}/feed.rss`,
        target: '_blank',
      });
    }

    if ('share' in navigator) {
      menu.push({
        text: intl.formatMessage(messages.share, { name: account.username }),
        action: handleShare,
        icon: require('@tabler/icons/outline/upload.svg'),
      });
    }

    if (features.federating && !account.local) {
      const domain = account.fqn.split('@')[1];

      menu.push({
        text: intl.formatMessage(messages.profileExternal, { domain }),
        action: () => onProfileExternal(account.url),
        icon: require('@tabler/icons/outline/external-link.svg'),
      });
    }

    menu.push({
      text: intl.formatMessage(messages.copy),
      action: handleCopy,
      icon: require('@tabler/icons/outline/clipboard-copy.svg'),
    });

    if (!ownAccount) return menu;

    if (features.searchFromAccount) {
      menu.push({
        text: intl.formatMessage(account.id === ownAccount.id ? messages.searchSelf : messages.search, { name: account.username }),
        action: onSearch,
        icon: require('@fluentui/search_24_regular.svg'),
      });
    }

    if (menu.length) {
      menu.push(null);
    }

    if (account.id === ownAccount.id) {
      menu.push({
        text: intl.formatMessage(messages.edit_profile),
        to: '/settings/profile',
        icon: require('@fluentui/person_24_regular.svg'),
      });
      menu.push({
        text: intl.formatMessage(messages.preferences),
        to: '/settings',
        icon: require('@fluentui/settings_24_regular.svg'),
      });
      menu.push(null);
      menu.push({
        text: intl.formatMessage(messages.mutes),
        to: '/mutes',
        icon: require('@tabler/icons/outline/circle-x.svg'),
      });
      menu.push({
        text: intl.formatMessage(messages.blocks),
        to: '/blocks',
        icon: require('@tabler/icons/outline/ban.svg'),
      });
    } else {
      menu.push({
        text: intl.formatMessage(messages.mention, { name: account.username }),
        action: onMention,
        icon: require('@fluentui/mention_24_regular.svg'),
      });

      if (features.privacyScopes) {
        menu.push({
          text: intl.formatMessage(messages.direct, { name: account.username }),
          action: onDirect,
          icon: require('@fluentui/mail_24_regular.svg'),
        });
      }

      if (account.relationship?.following) {
        if (account.relationship?.showing_reblogs) {
          menu.push({
            text: intl.formatMessage(messages.hideReblogs, { name: account.username }),
            action: onReblogToggle,
            icon: require('@fluentui/arrow_repeat_all_24_regular.svg'),
          });
        } else {
          menu.push({
            text: intl.formatMessage(messages.showReblogs, { name: account.username }),
            action: onReblogToggle,
            icon: require('@fluentui/arrow_repeat_all_24_regular.svg'),
          });
        }

        if (features.lists) {
          menu.push({
            text: intl.formatMessage(messages.add_or_remove_from_list),
            action: onAddToList,
            icon: require('@fluentui/people_add_24_regular.svg'),
          });
        }

        if (features.accountEndorsements) {
          menu.push({
            text: intl.formatMessage(account.relationship?.endorsed ? messages.unendorse : messages.endorse),
            action: onEndorseToggle,
            icon: require('@tabler/icons/outline/user-check.svg'),
          });
        }
      } else if (features.lists && features.unrestrictedLists) {
        menu.push({
          text: intl.formatMessage(messages.add_or_remove_from_list),
          action: onAddToList,
          icon: require('@fluentui/people_add_24_regular.svg'),
        });
      }

      if (features.bites) {
        menu.push({
          text: intl.formatMessage(messages.bite, { name: account.username }),
          action: onBite,
          icon: require('@tabler/icons/outline/pacman.svg'),
        });
      }

      menu.push(null);

      if (features.removeFromFollowers && account.relationship?.followed_by) {
        menu.push({
          text: intl.formatMessage(messages.removeFromFollowers),
          action: onRemoveFromFollowers,
          icon: require('@tabler/icons/outline/user-x.svg'),
        });
      }

      if (account.relationship?.muting) {
        menu.push({
          text: intl.formatMessage(messages.unmute, { name: account.username }),
          action: onMute,
          icon: require('@tabler/icons/outline/circle-x.svg'),
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.mute, { name: account.username }),
          action: onMute,
          icon: require('@tabler/icons/outline/circle-x.svg'),
        });
      }

      if (account.relationship?.blocking) {
        menu.push({
          text: intl.formatMessage(messages.unblock, { name: account.username }),
          action: onBlock,
          icon: require('@tabler/icons/outline/ban.svg'),
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.block, { name: account.username }),
          action: onBlock,
          icon: require('@tabler/icons/outline/ban.svg'),
        });
      }

      menu.push({
        text: intl.formatMessage(messages.report, { name: account.username }),
        action: onReport,
        icon: require('@tabler/icons/outline/flag.svg'),
      });
    }

    if (!account.local) {
      const domain = account.fqn.split('@')[1];

      menu.push(null);

      if (account.relationship?.domain_blocking) {
        menu.push({
          text: intl.formatMessage(messages.unblockDomain, { domain }),
          action: () => onUnblockDomain(domain),
          icon: require('@tabler/icons/outline/ban.svg'),
        });
      } else {
        menu.push({
          text: intl.formatMessage(messages.blockDomain, { domain }),
          action: () => onBlockDomain(domain),
          icon: require('@tabler/icons/outline/ban.svg'),
        });
      }
    }

    if (ownAccount.is_admin || ownAccount.is_moderator) {
      menu.push(null);

      menu.push({
        text: intl.formatMessage(messages.adminAccount, { name: account.username }),
        action: onModerate,
        icon: require('@tabler/icons/outline/gavel.svg'),
      });
    }

    return menu;
  };

  const makeInfo = () => {
    const info: React.ReactNode[] = [];

    if (!account || !ownAccount) return info;

    if (ownAccount.id !== account.id && account.relationship?.followed_by) {
      info.push(
        <Badge
          key='followed_by'
          slug='opaque'
          title={<FormattedMessage id='account.follows_you' defaultMessage='Follows you' />}
        />,
      );
    } else if (ownAccount.id !== account.id && account.relationship?.blocking) {
      info.push(
        <Badge
          key='blocked'
          slug='opaque'
          title={<FormattedMessage id='account.blocked' defaultMessage='Blocked' />}
        />,
      );
    }

    if (ownAccount.id !== account.id && account.relationship?.muting) {
      info.push(
        <Badge
          key='muted'
          slug='opaque'
          title={<FormattedMessage id='account.muted' defaultMessage='Muted' />}
        />,
      );
    } else if (ownAccount.id !== account.id && account.relationship?.domain_blocking) {
      info.push(
        <Badge
          key='domain_blocked'
          slug='opaque'
          title={<FormattedMessage id='account.domain_blocked' defaultMessage='Domain hidden' />}
        />,
      );
    }

    return info;
  };

  const renderHeader = () => {
    let header: React.ReactNode;

    if (account.header) {
      header = (
        <StillImage
          src={account.header}
          alt={account.header_description || intl.formatMessage(messages.header)}
        />
      );

      if (!isDefaultHeader(account.header)) {
        header = (
          <a href={account.header} onClick={handleHeaderClick} target='_blank'>
            {header}
          </a>
        );
      }
    }

    return header;
  };

  const renderMessageButton = () => {
    if (!ownAccount || !account || account.id === ownAccount?.id) {
      return null;
    }

    if (account.accepts_chat_messages) {
      return (
        <IconButton
          src={require('@fluentui/chat_24_regular.svg')}
          onClick={() => createAndNavigateToChat.mutate(account.id)}
          title={intl.formatMessage(messages.chat, { name: account.username })}
          theme='outlined'
          className='px-2'
          iconClassName='h-4 w-4'
        />
      );
    } else {
      return null;
    }
  };

  const renderShareButton = () => {
    const canShare = 'share' in navigator;

    if (!(account && ownAccount?.id && account.id === ownAccount?.id && canShare)) {
      return null;
    }

    return (
      <IconButton
        src={require('@tabler/icons/outline/upload.svg')}
        onClick={handleShare}
        title={intl.formatMessage(messages.share, { name: account.username })}
        theme='outlined'
        className='px-2'
        iconClassName='h-4 w-4'
      />
    );
  };

  const renderRssButton = () => {
    if (ownAccount || !features.rssFeeds || !account.local || (software === GOTOSOCIAL && !account.enable_rss)) {
      return null;
    }

    const href = software === MASTODON ? `${account.url}.rss` : `${account.url}/feed.rss`;

    return (
      <IconButton
        src={require('@tabler/icons/outline/rss.svg')}
        href={href}
        title={intl.formatMessage(messages.subscribeFeed)}
        theme='outlined'
        className='px-2'
        iconClassName='h-4 w-4'
      />
    );
  };

  const info = makeInfo();
  const menu = makeMenu();

  return (
    <div className='-mx-4 -mt-4 sm:-mx-6 sm:-mt-6'>
      {(account.moved && typeof account.moved === 'object') && (
        <MovedNote from={account} to={account.moved as Account} />
      )}

      <div>
        <div className='relative isolate flex h-32 w-full flex-col justify-center overflow-hidden bg-gray-200 black:rounded-t-none dark:bg-gray-900/50 md:rounded-t-xl lg:h-48'>
          {renderHeader()}

          <div className='absolute left-2 top-2'>
            <HStack alignItems='center' space={1}>
              {info}
            </HStack>
          </div>
        </div>
      </div>

      <div className='px-4 sm:px-6'>
        <HStack className='-mt-12' alignItems='bottom' space={5}>
          <div className='relative flex'>
            <a href={account.avatar} onClick={handleAvatarClick} target='_blank'>
              <Avatar
                src={account.avatar}
                alt={account.avatar_description}
                size={96}
                className='relative size-24 rounded-full bg-white ring-4 ring-white black:ring-black dark:bg-primary-900 dark:ring-primary-900'
              />
            </a>
            {account.verified && (
              <div className='absolute bottom-0 right-0'>
                <VerificationBadge className='!size-[24px] rounded-full !p-[2px] ring-2 ring-white black:ring-black dark:ring-primary-900' />
              </div>
            )}
          </div>

          <div className='mt-6 flex w-full justify-end sm:pb-1'>
            <HStack space={2} className='mt-10'>
              <SubscriptionButton account={account} />
              {renderMessageButton()}
              {renderShareButton()}

              {menu.length > 0 && (
                <DropdownMenu items={menu} placement='bottom-end'>
                  <IconButton
                    src={require('@fluentui/more_horizontal_24_regular.svg')}
                    theme='outlined'
                    className='px-2'
                    iconClassName='h-4 w-4'
                  />
                </DropdownMenu>
              )}

              {renderRssButton()}

              <ActionButton account={account} />
            </HStack>
          </div>
        </HStack>
      </div>
    </div>
  );
};

export { Header as default };
