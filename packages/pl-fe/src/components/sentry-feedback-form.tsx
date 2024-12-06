import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Button from 'pl-fe/components/ui/button';
import Form from 'pl-fe/components/ui/form';
import FormActions from 'pl-fe/components/ui/form-actions';
import FormGroup from 'pl-fe/components/ui/form-group';
import Text from 'pl-fe/components/ui/text';
import Textarea from 'pl-fe/components/ui/textarea';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { captureSentryFeedback } from 'pl-fe/sentry';

interface ISentryFeedbackForm {
  eventId: string;
}

/** Accept feedback for the given Sentry event. */
const SentryFeedbackForm: React.FC<ISentryFeedbackForm> = ({ eventId }) => {
  const { account } = useOwnAccount();

  const [feedback, setFeedback] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleFeedbackChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setFeedback(e.target.value);
  };

  const handleSubmitFeedback: React.FormEventHandler = async (_e) => {
    if (!feedback || !eventId) return;
    setIsSubmitting(true);

    await captureSentryFeedback({
      name: account?.acct,
      event_id: eventId,
      comments: feedback,
    }).catch(console.error);

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Text align='center'>
        <FormattedMessage id='alert.unexpected.thanks' defaultMessage='Thanks for your feedback!' />
      </Text>
    );
  }

  return (
    <Form onSubmit={handleSubmitFeedback}>
      <FormGroup>
        <Textarea
          value={feedback}
          onChange={handleFeedbackChange}
          placeholder='Anything you can tell us about what happened?'
          disabled={isSubmitting}
          autoGrow
        />
      </FormGroup>

      <FormActions>
        <Button type='submit' className='mx-auto' disabled={!feedback || isSubmitting}>
          <FormattedMessage id='alert.unexpected.submit_feedback' defaultMessage='Submit Feedback' />
        </Button>
      </FormActions>
    </Form>
  );
};

export { SentryFeedbackForm as default };
