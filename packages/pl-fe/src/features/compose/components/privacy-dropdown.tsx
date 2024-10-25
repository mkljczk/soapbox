import React, { useEffect, useMemo } from 'react';
import { useIntl, defineMessages, IntlShape } from 'react-intl';

import { changeComposeFederated, changeComposeVisibility } from 'pl-fe/actions/compose';
import { fetchLists } from 'pl-fe/actions/lists';
import DropdownMenu, { MenuItem } from 'pl-fe/components/dropdown-menu';
import Button from 'pl-fe/components/ui/button';
import { getOrderedLists } from 'pl-fe/features/lists';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useCompose } from 'pl-fe/hooks/use-compose';
import { useFeatures } from 'pl-fe/hooks/use-features';

import type { Features } from 'pl-api';

const messages = defineMessages({
  public_short: { id: 'privacy.public.short', defaultMessage: 'Public' },
  public_long: { id: 'privacy.public.long', defaultMessage: 'Post to public timelines' },
  unlisted_short: { id: 'privacy.unlisted.short', defaultMessage: 'Unlisted' },
  unlisted_long: { id: 'privacy.unlisted.long', defaultMessage: 'Do not post to public timelines' },
  private_short: { id: 'privacy.private.short', defaultMessage: 'Followers-only' },
  private_long: { id: 'privacy.private.long', defaultMessage: 'Post to followers only' },
  mutuals_only_short: { id: 'privacy.mutuals_only.short', defaultMessage: 'Mutuals-only' },
  mutuals_only_long: { id: 'privacy.mutuals_only.long', defaultMessage: 'Post to mutually followed users only' },
  direct_short: { id: 'privacy.direct.short', defaultMessage: 'Direct' },
  direct_long: { id: 'privacy.direct.long', defaultMessage: 'Post to mentioned users only' },
  local_short: { id: 'privacy.local.short', defaultMessage: 'Local-only' },
  local_long: { id: 'privacy.local.long', defaultMessage: 'Only visible on your instance' },
  list_short: { id: 'privacy.list.short', defaultMessage: 'List only' },
  list_long: { id: 'privacy.list.long', defaultMessage: 'Visible to members of a list' },

  change_privacy: { id: 'privacy.change', defaultMessage: 'Adjust post privacy' },
  local: { id: 'privacy.local', defaultMessage: '{privacy} (local-only)' },
});

interface Option {
  icon: string;
  value: string;
  text: string;
  meta?: string;
  items?: Array<Omit<Option, 'items'>>;
}

const getItems = (features: Features, lists: ReturnType<typeof getOrderedLists>, intl: IntlShape) => [
  {
    icon: require('@tabler/icons/outline/world.svg'),
    value: 'public',
    text: intl.formatMessage(messages.public_short),
    meta: intl.formatMessage(messages.public_long),
  },
  {
    icon: require('@tabler/icons/outline/lock-open.svg'),
    value: 'unlisted',
    text: intl.formatMessage(messages.unlisted_short),
    meta: intl.formatMessage(messages.unlisted_long),
  },
  {
    icon: require('@tabler/icons/outline/lock.svg'),
    value: 'private',
    text: intl.formatMessage(messages.private_short),
    meta: intl.formatMessage(messages.private_long),
  },
  features.visibilityMutualsOnly ? {
    icon: require('@tabler/icons/outline/users-group.svg'),
    value: 'mutuals_only',
    text: intl.formatMessage(messages.mutuals_only_short),
    meta: intl.formatMessage(messages.mutuals_only_long),
  } : undefined,
  {
    icon: require('@tabler/icons/outline/mail.svg'),
    value: 'direct',
    text: intl.formatMessage(messages.direct_short),
    meta: intl.formatMessage(messages.direct_long),
  },
  features.visibilityLocalOnly ? {
    icon: require('@tabler/icons/outline/affiliate.svg'),
    value: 'local',
    text: intl.formatMessage(messages.local_short),
    meta: intl.formatMessage(messages.local_long),
  } : undefined,
  features.addressableLists && !lists.isEmpty() ? {
    icon: require('@tabler/icons/outline/list.svg'),
    value: '',
    items: lists.toArray().map((list) => ({
      icon: require('@tabler/icons/outline/list.svg'),
      value: `list:${list.id}`,
      text: list.title,
    })),
    text: intl.formatMessage(messages.list_short),
    meta: intl.formatMessage(messages.list_long),
  } as Option : undefined,
].filter((option): option is Option => !!option);

interface IPrivacyDropdown {
  composeId: string;
}

const PrivacyDropdown: React.FC<IPrivacyDropdown> = ({
  composeId,
}) => {
  const intl = useIntl();
  const features = useFeatures();
  const dispatch = useAppDispatch();

  const compose = useCompose(composeId);
  const lists = useAppSelector((state) => getOrderedLists(state));

  const value = compose.privacy;
  const unavailable = compose.id;

  const onChange = (value: string) => value && dispatch(changeComposeVisibility(composeId,
    value));

  const options = useMemo(() => getItems(features, lists, intl), [features, lists]);
  const items: Array<MenuItem> = options.map(item => ({
    ...item,
    action: item.value ? () => onChange(item.value) : undefined,
    active: item.value === value || item.items?.some((item) => item.value === value),
    items: item.items?.map(item => ({
      ...item,
      action: item.value ? () => onChange(item.value) : undefined,
      active: item.value === value,
    })),
  }));

  useEffect(() => {
    if (features.addressableLists) dispatch(fetchLists());
  }, []);

  if (features.localOnlyStatuses) items.push({
    icon: require('@tabler/icons/outline/affiliate.svg'),
    text: intl.formatMessage(messages.local_short),
    meta: intl.formatMessage(messages.local_long),
    type: 'toggle',
    checked: !compose.federated,
    onChange: () => dispatch(changeComposeFederated(composeId)),
  });

  const valueOption = useMemo(() => [
    options,
    options.filter(option => option.items).map(option => option.items).flat(),
  ].flat().find(item => item!.value === value), [value]);

  if (unavailable) {
    return null;
  }

  return (
    <DropdownMenu items={items}>
      <Button
        theme='muted'
        size='xs'
        text={compose.federated ? valueOption?.text : intl.formatMessage(messages.local, {
          privacy: valueOption?.text,
        })}
        icon={valueOption?.icon}
        secondaryIcon={require('@tabler/icons/outline/chevron-down.svg')}
        title={intl.formatMessage(messages.change_privacy)}
      />
    </DropdownMenu>
  );
};

export { PrivacyDropdown as default };
