import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';
import Form from 'pl-fe/components/ui/form';
import FormGroup from 'pl-fe/components/ui/form-group';
import Input from 'pl-fe/components/ui/input';
import Textarea from 'pl-fe/components/ui/textarea';
import AvatarPicker from 'pl-fe/features/edit-profile/components/avatar-picker';
import HeaderPicker from 'pl-fe/features/edit-profile/components/header-picker';
import { usePreview } from 'pl-fe/hooks/forms/use-preview';
import resizeImage from 'pl-fe/utils/resize-image';

import type { CreateGroupParams } from 'pl-api';

const messages = defineMessages({
  groupNamePlaceholder: { id: 'manage_group.fields.name_placeholder', defaultMessage: 'Group Name' },
  groupDescriptionPlaceholder: { id: 'manage_group.fields.description_placeholder', defaultMessage: 'Description' },
  hashtagPlaceholder: { id: 'manage_group.fields.hashtag_placeholder', defaultMessage: 'Add a topic' },
});

interface IDetailsStep {
  params: CreateGroupParams;
  onChange: (params: CreateGroupParams) => void;
}

const DetailsStep: React.FC<IDetailsStep> = ({ params, onChange }) => {
  const intl = useIntl();
  const { data: instance } = useInstance();

  const {
    display_name: displayName = '',
    note = '',
  } = params;

  const avatarSrc = usePreview(params.avatar);
  const headerSrc = usePreview(params.header);

  const attachmentTypes = useInstance().data.configuration.media_attachments.supported_mime_types
    ?.filter((type) => type.startsWith('image/'))
    .join(',');

  const handleTextChange = (property: keyof CreateGroupParams): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> => (e) => {
    onChange({ ...params, [property]: e.target.value });
  };

  const handleImageChange = (property: 'header' | 'avatar', maxPixels?: number) =>
    async (files: FileList | null) => {
      const file = files ? files[0] : undefined;
      if (file) {
        const resized = await resizeImage(file, maxPixels);
        onChange({
          ...params,
          [property]: resized,
        });
      }
    };

  const handleImageClear = (property: keyof CreateGroupParams) => () => onChange({
    ...params,
    [property]: undefined,
  });

  return (
    <Form>
      <div className='relative mb-12 flex'>
        <HeaderPicker src={headerSrc} accept={attachmentTypes} onChange={handleImageChange('header', 1920 * 1080)} onClear={handleImageClear('header')} />
        <AvatarPicker src={avatarSrc} accept={attachmentTypes} onChange={handleImageChange('avatar', 400 * 400)} />
      </div>

      <FormGroup
        labelText={<FormattedMessage id='manage_group.fields.name_label' defaultMessage='Group name (required)' />}
        hintText={<FormattedMessage id='manage_group.fields.name_help' defaultMessage='This cannot be changed after the group is created.' />}
      >
        <Input
          type='text'
          placeholder={intl.formatMessage(messages.groupNamePlaceholder)}
          value={displayName}
          onChange={handleTextChange('display_name')}
          maxLength={Number(instance.configuration.groups.max_characters_name)}
        />
      </FormGroup>

      <FormGroup
        labelText={<FormattedMessage id='manage_group.fields.description_label' defaultMessage='Description' />}
      >
        <Textarea
          autoComplete='off'
          placeholder={intl.formatMessage(messages.groupDescriptionPlaceholder)}
          value={note}
          onChange={handleTextChange('note')}
          maxLength={Number(instance.configuration.groups.max_characters_description)}
        />
      </FormGroup>
    </Form>
  );
};

export { DetailsStep as default };
