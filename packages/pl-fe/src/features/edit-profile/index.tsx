import pick from 'lodash/pick';
import { GOTOSOCIAL } from 'pl-api';
import React, { useState, useEffect } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { updateNotificationSettings } from 'pl-fe/actions/accounts';
import { patchMe } from 'pl-fe/actions/me';
import BirthdayInput from 'pl-fe/components/birthday-input';
import List, { ListItem } from 'pl-fe/components/list';
import Button from 'pl-fe/components/ui/button';
import Column from 'pl-fe/components/ui/column';
import Form from 'pl-fe/components/ui/form';
import FormActions from 'pl-fe/components/ui/form-actions';
import FormGroup from 'pl-fe/components/ui/form-group';
import HStack from 'pl-fe/components/ui/hstack';
import Input from 'pl-fe/components/ui/input';
import Streamfield from 'pl-fe/components/ui/streamfield';
import Textarea from 'pl-fe/components/ui/textarea';
import Toggle from 'pl-fe/components/ui/toggle';
import { useImageField } from 'pl-fe/hooks/forms/use-image-field';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import toast from 'pl-fe/toast';
import { isDefaultAvatar, isDefaultHeader } from 'pl-fe/utils/accounts';

import AvatarPicker from './components/avatar-picker';
import HeaderPicker from './components/header-picker';

import type { StreamfieldComponent } from 'pl-fe/components/ui/streamfield';
import type { Account } from 'pl-fe/normalizers/account';

const nonDefaultAvatar = (url: string | undefined) => url && isDefaultAvatar(url) ? undefined : url;
const nonDefaultHeader = (url: string | undefined) => url && isDefaultHeader(url) ? undefined : url;

/**
 * Whether the user is hiding their follows and/or followers.
 * Pleroma's config is granular, but we simplify it into one setting.
 */
const hidesNetwork = ({ __meta }: Account): boolean => Boolean(
  __meta.pleroma?.hide_followers && __meta.pleroma?.hide_follows && __meta.pleroma?.hide_followers_count && __meta.pleroma?.hide_follows_count,
);

const messages = defineMessages({
  heading: { id: 'column.edit_profile', defaultMessage: 'Edit profile' },
  header: { id: 'edit_profile.header', defaultMessage: 'Edit profile' },
  metaFieldLabel: { id: 'edit_profile.fields.meta_fields.label_placeholder', defaultMessage: 'Label' },
  metaFieldContent: { id: 'edit_profile.fields.meta_fields.content_placeholder', defaultMessage: 'Content' },
  firstMetaFieldLabel: { id: 'edit_profile.fields.meta_fields.label_placeholder.first', defaultMessage: 'Label (e.g. pronouns)' },
  success: { id: 'edit_profile.success', defaultMessage: 'Your profile has been successfully saved!' },
  error: { id: 'edit_profile.error', defaultMessage: 'Profile update failed' },
  bioPlaceholder: { id: 'edit_profile.fields.bio_placeholder', defaultMessage: 'Tell us about yourself.' },
  displayNamePlaceholder: { id: 'edit_profile.fields.display_name_placeholder', defaultMessage: 'Name' },
  locationPlaceholder: { id: 'edit_profile.fields.location_placeholder', defaultMessage: 'Location' },
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
});

/**
 * Profile metadata `name` and `value`.
 * (By default, max 4 fields and 255 characters per property/value)
 */
interface AccountCredentialsField {
  name: string;
  value: string;
}

/** Private information (settings) for the account. */
interface AccountCredentialsSource {
  /** Default post privacy for authored statuses. */
  privacy?: string;
  /** Whether to mark authored statuses as sensitive by default. */
  sensitive?: boolean;
  /** Default language to use for authored statuses. (ISO 6391) */
  language?: string;
}

/**
 * Params to submit when updating an account.
 * @see PATCH /api/v1/accounts/update_credentials
 */
interface AccountCredentials {
  /** Whether the account should be shown in the profile directory. */
  discoverable?: boolean;
  /** Whether the account has a bot flag. */
  bot?: boolean;
  /** The display name to use for the profile. */
  display_name?: string;
  /** The account bio. */
  note?: string;
  /** Avatar image encoded using multipart/form-data */
  avatar?: File | '';
  /** Header image encoded using multipart/form-data */
  header?: File | '';
  /** Whether manual approval of follow requests is required. */
  locked?: boolean;
  /** Private information (settings) about the account. */
  source?: AccountCredentialsSource;
  /** Custom profile fields. */
  fields_attributes?: AccountCredentialsField[];

  // Non-Mastodon fields
  /** Pleroma: whether to accept notifications from people you don't follow. */
  stranger_notifications?: boolean;
  /** Pleroma: whether to publicly display followers. */
  hide_followers?: boolean;
  /** Pleroma: whether to publicly display follows. */
  hide_follows?: boolean;
  /** Pleroma: whether to publicly display follower count. */
  hide_followers_count?: boolean;
  /** Pleroma: whether to publicly display follows count. */
  hide_follows_count?: boolean;
  /** User's location. */
  location?: string;
  /** User's birthday. */
  birthday?: string;
  /** GoToSocial: Avatar image description. */
  avatar_description?: string;
  /** GoToSocial: Header image description. */
  header_description?: string;
  /** GoToSocial: Enable RSS feed for public posts */
  enable_rss?: boolean;
  /** GoToSocial: whether to publicly display followers/follows. */
  hide_collections?: boolean;
}

/** Convert an account into an update_credentials request object. */
const accountToCredentials = (account: Account): AccountCredentials => {
  const hideNetwork = hidesNetwork(account);

  return {
    ...(pick(account, ['discoverable', 'bot', 'display_name', 'locked', 'location', 'avatar_description', 'header_description', 'enable_rss', 'hide_collections'])),
    note: account.__meta.source?.note ?? '',
    fields_attributes: [...account.__meta.source?.fields ?? []],
    stranger_notifications: account.__meta.pleroma?.notification_settings?.block_from_strangers === true,
    hide_followers: hideNetwork,
    hide_follows: hideNetwork,
    hide_followers_count: hideNetwork,
    hide_follows_count: hideNetwork,
    birthday: account.birthday ?? undefined,
  };
};

const ProfileField: StreamfieldComponent<AccountCredentialsField> = ({ index, value, onChange }) => {
  const intl = useIntl();

  const handleChange = (key: string): React.ChangeEventHandler<HTMLInputElement> => e => {
    onChange({ ...value, [key]: e.currentTarget.value });
  };

  return (
    <HStack space={2} grow>
      <Input
        type='text'
        outerClassName='w-2/5 grow'
        value={value.name}
        onChange={handleChange('name')}
        placeholder={index === 0 ? intl.formatMessage(messages.firstMetaFieldLabel) : intl.formatMessage(messages.metaFieldLabel)}
      />
      <Input
        type='text'
        outerClassName='w-3/5 grow'
        value={value.value}
        onChange={handleChange('value')}
        placeholder={intl.formatMessage(messages.metaFieldContent)}
      />
    </HStack>
  );
};

/** Edit profile page. */
const EditProfile: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const instance = useInstance();

  const { account } = useOwnAccount();
  const features = useFeatures();
  const maxFields = instance.configuration.accounts
    ? instance.configuration.accounts.max_profile_fields
    : instance.pleroma.metadata.fields_limits.max_fields;

  const attachmentTypes = useAppSelector(
    state => state.instance.configuration.media_attachments.supported_mime_types)
    ?.filter(type => type.startsWith('image/'))
    .join(',');

  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState<AccountCredentials>({});
  const [muteStrangers, setMuteStrangers] = useState(false);

  const avatar = useImageField({ maxPixels: 400 * 400, preview: nonDefaultAvatar(account?.avatar) });
  const header = useImageField({ maxPixels: 1920 * 1080, preview: nonDefaultHeader(account?.header) });

  useEffect(() => {
    if (account) {
      const credentials = accountToCredentials(account);
      const strangerNotifications = account.__meta.pleroma?.notification_settings?.block_from_strangers === true;
      setData(credentials);
      setMuteStrangers(strangerNotifications);
    }
  }, [account?.id]);

  /** Set a single key in the request data. */
  const updateData = (key: string, value: any) => {
    setData(prevData => ({ ...prevData, [key]: value }));
  };

  const handleSubmit: React.FormEventHandler = (event) => {
    const promises = [];

    const params = { ...data };
    if (params.fields_attributes?.length === 0) params.fields_attributes = [{ name: '', value: '' }];
    if (header.file !== undefined) params.header = header.file || '';
    if (avatar.file !== undefined) params.avatar = avatar.file || '';

    promises.push(dispatch(patchMe(params as any)));

    if (features.muteStrangers) {
      promises.push(
        dispatch(updateNotificationSettings({
          block_from_strangers: muteStrangers,
        })).catch(console.error),
      );
    }

    setLoading(true);

    Promise.all(promises).then(() => {
      setLoading(false);
      toast.success(intl.formatMessage(messages.success));
    }).catch(() => {
      setLoading(false);
      toast.error(intl.formatMessage(messages.error));
    });

    event.preventDefault();
  };

  const handleFieldChange = <T = any>(key: keyof AccountCredentials) => (value: T) => {
    updateData(key, value);
  };

  const handleCheckboxChange = (key: keyof AccountCredentials): React.ChangeEventHandler<HTMLInputElement> => e => {
    updateData(key, e.target.checked);
  };

  const handleTextChange = (key: keyof AccountCredentials): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> => e => {
    updateData(key, e.target.value);
  };

  const handleBirthdayChange = (date: string) => {
    updateData('birthday', date);
  };

  const handleHideNetworkChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const hide = e.target.checked;
    setData(prevData => ({
      ...prevData,
      ...(features.version.software === GOTOSOCIAL ? { hide_collections: hide } : {
        hide_followers: hide,
        hide_follows: hide,
        hide_followers_count: hide,
        hide_follows_count: hide,
      }),
    }));
  };

  const handleFieldsChange = (fields: AccountCredentialsField[]) => {
    updateData('fields_attributes', fields);
  };

  const handleAddField = () => {
    const oldFields = data.fields_attributes || [];
    const fields = [...oldFields, { name: '', value: '' }];
    updateData('fields_attributes', fields);
  };

  const handleRemoveField = (i: number) => {
    const oldFields = data.fields_attributes || [];
    const fields = [...oldFields];
    fields.splice(i, 1);
    updateData('fields_attributes', fields);
  };

  const handleAvatarChangeDescription = features.accountAvatarDescription
    ? handleFieldChange<string>('avatar_description') : undefined;
  const handleHeaderChangeDescription = features.accountAvatarDescription
    ? handleFieldChange<string>('header_description') : undefined;

  return (
    <Column label={intl.formatMessage(messages.header)}>
      <Form onSubmit={handleSubmit}>
        <div className='relative mb-12 flex'>
          <HeaderPicker
            accept={attachmentTypes}
            disabled={isLoading}
            description={data.header_description}
            onChangeDescription={handleHeaderChangeDescription}
            {...header}
          />
          <AvatarPicker
            className='!sm:left-6 !left-4 !translate-x-0'
            accept={attachmentTypes}
            disabled={isLoading}
            description={data.avatar_description}
            onChangeDescription={handleAvatarChangeDescription}
            {...avatar}
          />
        </div>

        <FormGroup
          labelText={<FormattedMessage id='edit_profile.fields.display_name_label' defaultMessage='Display name' />}
        >
          <Input
            type='text'
            value={data.display_name}
            onChange={handleTextChange('display_name')}
            placeholder={intl.formatMessage(messages.displayNamePlaceholder)}
          />
        </FormGroup>

        {features.birthdays && (
          <FormGroup
            labelText={<FormattedMessage id='edit_profile.fields.birthday_label' defaultMessage='Birthday' />}
          >
            <BirthdayInput
              value={data.birthday}
              onChange={handleBirthdayChange}
            />
          </FormGroup>
        )}

        {features.accountLocation && (
          <FormGroup
            labelText={<FormattedMessage id='edit_profile.fields.location_label' defaultMessage='Location' />}
          >
            <Input
              type='text'
              value={data.location}
              onChange={handleTextChange('location')}
              placeholder={intl.formatMessage(messages.locationPlaceholder)}
            />
          </FormGroup>
        )}

        <FormGroup
          labelText={<FormattedMessage id='edit_profile.fields.bio_label' defaultMessage='Bio' />}
        >
          <Textarea
            value={data.note}
            onChange={handleTextChange('note')}
            autoComplete='off'
            placeholder={intl.formatMessage(messages.bioPlaceholder)}
          />
        </FormGroup>

        <List>
          {features.followRequests && (
            <ListItem
              label={<FormattedMessage id='edit_profile.fields.locked_label' defaultMessage='Lock account' />}
              hint={<FormattedMessage id='edit_profile.hints.locked' defaultMessage='Requires you to manually approve followers' />}
            >
              <Toggle
                checked={data.locked}
                onChange={handleCheckboxChange('locked')}
              />
            </ListItem>
          )}

          {features.hideNetwork && (
            <ListItem
              label={<FormattedMessage id='edit_profile.fields.hide_network_label' defaultMessage='Hide network' />}
              hint={<FormattedMessage id='edit_profile.hints.hide_network' defaultMessage='Who you follow and who follows you will not be shown on your profile' />}
            >
              <Toggle
                checked={account ? (features.version.software === GOTOSOCIAL ? data.hide_collections : (data.hide_followers && data.hide_follows && data.hide_followers_count && data.hide_follows_count)) : false}
                onChange={handleHideNetworkChange}
              />
            </ListItem>
          )}

          {features.bots && (
            <ListItem
              label={<FormattedMessage id='edit_profile.fields.bot_label' defaultMessage='This is a bot account' />}
              hint={<FormattedMessage id='edit_profile.hints.bot' defaultMessage='This account mainly performs automated actions and might not be monitored' />}
            >
              <Toggle
                checked={data.bot}
                onChange={handleCheckboxChange('bot')}
              />
            </ListItem>
          )}

          {features.muteStrangers && (
            <ListItem
              label={<FormattedMessage id='edit_profile.fields.stranger_notifications_label' defaultMessage='Block notifications from strangers' />}
              hint={<FormattedMessage id='edit_profile.hints.stranger_notifications' defaultMessage='Only show notifications from people you follow' />}
            >
              <Toggle
                checked={muteStrangers}
                onChange={(e) => setMuteStrangers(e.target.checked)}
              />
            </ListItem>
          )}

          {features.profileDirectory && (
            <ListItem
              label={<FormattedMessage id='edit_profile.fields.discoverable_label' defaultMessage='Allow account discovery' />}
              hint={<FormattedMessage id='edit_profile.hints.discoverable' defaultMessage='Display account in profile directory and allow indexing by external services' />}
            >
              <Toggle
                checked={data.discoverable}
                onChange={handleCheckboxChange('discoverable')}
              />
            </ListItem>
          )}

          {features.rssFeeds && features.version.software === GOTOSOCIAL && (
            <ListItem
              label={<FormattedMessage id='edit_profile.fields.rss_label' defaultMessage='Enable RSS feed for public posts' />}
            >
              <Toggle
                checked={data.enable_rss}
                onChange={handleCheckboxChange('enable_rss')}
              />
            </ListItem>
          )}
        </List>

        {features.profileFields && (
          <Streamfield
            label={<FormattedMessage id='edit_profile.fields.meta_fields_label' defaultMessage='Profile fields' />}
            hint={<FormattedMessage id='edit_profile.hints.meta_fields' defaultMessage='You can have up to {count, plural, one {# custom field} other {# custom fields}} displayed on your profile.' values={{ count: maxFields }} />}
            values={data.fields_attributes || []}
            onChange={handleFieldsChange}
            onAddItem={handleAddField}
            onRemoveItem={handleRemoveField}
            component={ProfileField}
            maxItems={maxFields}
            draggable
          />
        )}

        <FormActions>
          <Button to='/settings' theme='tertiary'>
            {intl.formatMessage(messages.cancel)}
          </Button>

          <Button theme='primary' type='submit' disabled={isLoading}>
            <FormattedMessage id='edit_profile.save' defaultMessage='Save' />
          </Button>
        </FormActions>
      </Form>
    </Column>
  );
};

export { EditProfile as default };
