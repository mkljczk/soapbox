import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useGroup } from 'pl-fe/api/hooks/groups/use-group';
import { useUpdateGroup } from 'pl-fe/api/hooks/groups/use-update-group';
import Button from 'pl-fe/components/ui/button';
import Column from 'pl-fe/components/ui/column';
import Form from 'pl-fe/components/ui/form';
import FormActions from 'pl-fe/components/ui/form-actions';
import FormGroup from 'pl-fe/components/ui/form-group';
import Icon from 'pl-fe/components/ui/icon';
import Input from 'pl-fe/components/ui/input';
import Spinner from 'pl-fe/components/ui/spinner';
import Textarea from 'pl-fe/components/ui/textarea';
import { useImageField } from 'pl-fe/hooks/forms/use-image-field';
import { useTextField } from 'pl-fe/hooks/forms/use-text-field';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import toast from 'pl-fe/toast';
import { isDefaultAvatar, isDefaultHeader } from 'pl-fe/utils/accounts';
import { unescapeHTML } from 'pl-fe/utils/html';

import AvatarPicker from '../edit-profile/components/avatar-picker';
import HeaderPicker from '../edit-profile/components/header-picker';

const nonDefaultAvatar = (url: string | undefined) => url && isDefaultAvatar(url) ? undefined : url;
const nonDefaultHeader = (url: string | undefined) => url && isDefaultHeader(url) ? undefined : url;

const messages = defineMessages({
  heading: { id: 'navigation_bar.edit_group', defaultMessage: 'Edit group' },
  groupSlugPlaceholder: { id: 'manage_group.fields.slug_placeholder', defaultMessage: 'Group slug' },
  groupNamePlaceholder: { id: 'manage_group.fields.name_placeholder', defaultMessage: 'Group name' },
  groupDescriptionPlaceholder: { id: 'manage_group.fields.description_placeholder', defaultMessage: 'Description' },
  groupSaved: { id: 'group.update.success', defaultMessage: 'Group successfully saved' },
});

interface IEditGroup {
  params: {
    groupId: string;
  };
}

const EditGroup: React.FC<IEditGroup> = ({ params: { groupId } }) => {
  const features = useFeatures();
  const intl = useIntl();
  const instance = useInstance();

  const { group, isLoading } = useGroup(groupId);
  const { updateGroup } = useUpdateGroup(groupId);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatar = useImageField({ maxPixels: 400 * 400, preview: nonDefaultAvatar(group?.avatar) });
  const header = useImageField({ maxPixels: 1920 * 1080, preview: nonDefaultHeader(group?.header) });

  const slug = useTextField(group?.slug);
  const displayName = useTextField(group?.display_name);
  const note = useTextField(unescapeHTML(group?.note));

  const maxName = Number(instance.configuration.groups.max_characters_name);
  const maxNote = Number(instance.configuration.groups.max_characters_description);

  const attachmentTypes = useAppSelector(state => state.instance.configuration.media_attachments.supported_mime_types)
    ?.filter((type) => type.startsWith('image/'))
    .join(',');

  const handleSubmit = async () => {
    setIsSubmitting(true);

    await updateGroup({
      display_name: displayName.value,
      note: note.value,
      avatar: avatar.file === null ? '' : avatar.file,
      header: header.file === null ? '' : header.file,
    }, {
      onSuccess() {
        toast.success(intl.formatMessage(messages.groupSaved));
      },
      onError(error) {
        const message = error.response?.json?.error;

        if (error.response?.status === 422 && typeof message !== 'undefined') {
          toast.error(message);
        }
      },
    });

    setIsSubmitting(false);
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form onSubmit={handleSubmit}>
        <div className='relative mb-12 flex'>
          <HeaderPicker accept={attachmentTypes} disabled={isSubmitting} {...header} />
          <AvatarPicker accept={attachmentTypes} disabled={isSubmitting} {...avatar} />
        </div>

        {features.groupsSlugs && (
          <FormGroup labelText={<FormattedMessage id='manage_group.fields.name_required_label' defaultMessage='Slug (required)' />}>
            <Input
              type='text'
              placeholder={intl.formatMessage(messages.groupSlugPlaceholder)}
              {...slug}
            />
          </FormGroup>
        )}

        <FormGroup labelText={<FormattedMessage id='manage_group.fields.name_label_optional' defaultMessage='Group name' />}>
          <Input
            type='text'
            placeholder={intl.formatMessage(messages.groupNamePlaceholder)}
            maxLength={maxName}
            {...displayName}
            append={<Icon className='size-5 text-gray-600' src={require('@tabler/icons/outline/lock.svg')} />}
            disabled
          />
        </FormGroup>

        <FormGroup labelText={<FormattedMessage id='manage_group.fields.description_label' defaultMessage='Description' />}>
          <Textarea
            autoComplete='off'
            placeholder={intl.formatMessage(messages.groupDescriptionPlaceholder)}
            maxLength={maxNote}
            {...note}
          />
        </FormGroup>

        <FormActions>
          <Button theme='primary' type='submit' disabled={isSubmitting} block>
            <FormattedMessage id='edit_profile.save' defaultMessage='Save' />
          </Button>
        </FormActions>
      </Form>
    </Column>
  );
};

export { EditGroup as default };
