import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeListEditorTitle, submitListEditor } from 'pl-fe/actions/lists';
import Button from 'pl-fe/components/ui/button';
import Form from 'pl-fe/components/ui/form';
import HStack from 'pl-fe/components/ui/hstack';
import Input from 'pl-fe/components/ui/input';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

const messages = defineMessages({
  label: { id: 'lists.new.title_placeholder', defaultMessage: 'New list title' },
  title: { id: 'lists.new.create', defaultMessage: 'Add list' },
  create: { id: 'lists.new.create_title', defaultMessage: 'Add list' },
});

const NewListForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const value = useAppSelector((state) => state.listEditor.title);
  const disabled = useAppSelector((state) => !!state.listEditor.isSubmitting);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeListEditorTitle(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent<Element>) => {
    e.preventDefault();
    dispatch(submitListEditor(true));
  };

  const label = intl.formatMessage(messages.label);
  const create = intl.formatMessage(messages.create);

  return (
    <Form onSubmit={handleSubmit}>
      <HStack space={2} alignItems='center'>
        <label className='grow'>
          <span style={{ display: 'none' }}>{label}</span>

          <Input
            type='text'
            value={value}
            disabled={disabled}
            onChange={handleChange}
            placeholder={label}
          />
        </label>

        <Button
          disabled={disabled}
          onClick={handleSubmit}
          theme='primary'
        >
          {create}
        </Button>
      </HStack>
    </Form>
  );
};

export { NewListForm as default };
