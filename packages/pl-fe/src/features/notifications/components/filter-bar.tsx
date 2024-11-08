import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { type FilterType, setFilter } from 'pl-fe/actions/notifications';
import Icon from 'pl-fe/components/ui/icon';
import Tabs from 'pl-fe/components/ui/tabs';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useSettings } from 'pl-fe/hooks/use-settings';

import type { Item } from 'pl-fe/components/ui/tabs';

const messages = defineMessages({
  all: { id: 'notifications.filter.all', defaultMessage: 'All' },
  mentions: { id: 'notifications.filter.mentions', defaultMessage: 'Mentions' },
  statuses: { id: 'notifications.filter.statuses', defaultMessage: 'Updates from people you follow' },
  favourites: { id: 'notifications.filter.favourites', defaultMessage: 'Likes' },
  boosts: { id: 'notifications.filter.boosts', defaultMessage: 'Reposts' },
  polls: { id: 'notifications.filter.polls', defaultMessage: 'Poll results' },
  events: { id: 'notifications.filter.events', defaultMessage: 'Events' },
  follows: { id: 'notifications.filter.follows', defaultMessage: 'Follows' },
});

const NotificationFilterBar = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const settings = useSettings();
  const features = useFeatures();

  const selectedFilter = settings.notifications.quickFilter.active;
  const advancedMode = settings.notifications.quickFilter.advanced;

  const onClick = (notificationType: FilterType) => () => {
    try {
      dispatch(setFilter(notificationType, true));
    } catch (e) {
      console.error(e);
    }
  };

  const items: Item[] = [
    {
      text: intl.formatMessage(messages.all),
      action: onClick('all'),
      name: 'all',
    },
  ];

  if (!advancedMode) {
    items.push({
      text: intl.formatMessage(messages.mentions),
      action: onClick('mention'),
      name: 'mention',
    });
  } else {
    items.push({
      text: <Icon className='size-4' src={require('@fluentui/mention_24_regular.svg')} />,
      title: intl.formatMessage(messages.mentions),
      action: onClick('mention'),
      name: 'mention',
    });
    if (features.accountNotifies) items.push({
      text: <Icon className='size-4' src={require('@fluentui/alert_on_24_regular.svg')} />,
      title: intl.formatMessage(messages.statuses),
      action: onClick('status'),
      name: 'status',
    });
    items.push({
      text: <Icon className='size-4' src={require('@fluentui/star_24_regular.svg')} />,
      title: intl.formatMessage(messages.favourites),
      action: onClick('favourite'),
      name: 'favourite',
    });
    items.push({
      text: <Icon className='size-4' src={require('@fluentui/arrow_repeat_all_24_regular.svg')} />,
      title: intl.formatMessage(messages.boosts),
      action: onClick('reblog'),
      name: 'reblog',
    });
    if (features.polls) items.push({
      text: <Icon className='size-4' src={require('@fluentui/poll_24_regular.svg')} />,
      title: intl.formatMessage(messages.polls),
      action: onClick('poll'),
      name: 'poll',
    });
    if (features.events) items.push({
      text: <Icon className='size-4' src={require('@fluentui/calendar_ltr_24_regular.svg')} />,
      title: intl.formatMessage(messages.events),
      action: onClick('events'),
      name: 'events',
    });
    items.push({
      text: <Icon className='size-4' src={require('@fluentui/person_add_24_regular.svg')} />,
      title: intl.formatMessage(messages.follows),
      action: onClick('follow'),
      name: 'follow',
    });
  }

  return <Tabs items={items} activeItem={selectedFilter} />;
};

export { NotificationFilterBar as default };
