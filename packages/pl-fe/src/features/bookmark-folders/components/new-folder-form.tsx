import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { useCreateBookmarkFolder } from 'pl-fe/api/hooks/statuses/use-create-bookmark-folder';
import Button from 'pl-fe/components/ui/button';
import Form from 'pl-fe/components/ui/form';
import HStack from 'pl-fe/components/ui/hstack';
import Input from 'pl-fe/components/ui/input';
import { useTextField } from 'pl-fe/hooks/forms/use-text-field';
import toast from 'pl-fe/toast';

const messages = defineMessages({
  label: { id: 'bookmark_folders.new.title_placeholder', defaultMessage: 'New folder title' },
  createSuccess: { id: 'bookmark_folders.add.success', defaultMessage: 'Bookmark folder created successfully' },
  createFail: { id: 'bookmark_folders.add.fail', defaultMessage: 'Failed to create bookmark folder' },
});

const NewFolderForm: React.FC = () => {
  const intl = useIntl();

  const name = useTextField();

  const { createBookmarkFolder, isSubmitting } = useCreateBookmarkFolder();

  const handleSubmit = (e: React.FormEvent<Element>) => {
    e.preventDefault();
    createBookmarkFolder({
      name: name.value,
    }, {
      onSuccess() {
        toast.success(messages.createSuccess);
      },
      onError() {
        toast.success(messages.createFail);
      },
    });
  };

  const label = intl.formatMessage(messages.label);

  return (
    <Form onSubmit={handleSubmit}>
      <HStack space={2} alignItems='center'>
        <label className='grow'>
          <span style={{ display: 'none' }}>{label}</span>

          <Input
            type='text'
            placeholder={label}
            disabled={isSubmitting}
            {...name}
          />
        </label>

        <Button
          disabled={isSubmitting}
          onClick={handleSubmit}
          theme='primary'
        >
          <FormattedMessage id='bookmark_folders.new.create_title' defaultMessage='Add folder' />
        </Button>
      </HStack>
    </Form>
  );
};

export { NewFolderForm as default };
