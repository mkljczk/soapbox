import React, { useState } from 'react';
import { MessageDescriptor, useIntl } from 'react-intl';

import Button from 'pl-fe/components/ui/button';
import Form from 'pl-fe/components/ui/form';
import FormActions from 'pl-fe/components/ui/form-actions';
import Text from 'pl-fe/components/ui/text';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { AppDispatch, RootState } from 'pl-fe/store';

interface ICSVExporter {
  messages: {
    input_label: MessageDescriptor;
    input_hint: MessageDescriptor;
    submit: MessageDescriptor;
  };
  action: () => (dispatch: AppDispatch, getState: () => RootState) => Promise<any>;
}

const CSVExporter: React.FC<ICSVExporter> = ({ messages, action }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const [isLoading, setIsLoading] = useState(false);

  const handleClick: React.MouseEventHandler = (event) => {
    setIsLoading(true);
    dispatch(action()).then(() => {
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  };

  return (
    <Form>
      <Text size='xl' weight='bold'>{intl.formatMessage(messages.input_label)}</Text>
      <Text theme='muted'>{intl.formatMessage(messages.input_hint)}</Text>

      <FormActions>
        <Button theme='primary' onClick={handleClick} disabled={isLoading}>
          {intl.formatMessage(messages.submit)}
        </Button>
      </FormActions>
    </Form>
  );
};

export { CSVExporter as default };
