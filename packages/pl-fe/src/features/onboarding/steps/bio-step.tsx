import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { patchMe } from 'pl-fe/actions/me';
import { BigCard } from 'pl-fe/components/big-card';
import Button from 'pl-fe/components/ui/button';
import FormGroup from 'pl-fe/components/ui/form-group';
import Stack from 'pl-fe/components/ui/stack';
import Textarea from 'pl-fe/components/ui/textarea';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import toast from 'pl-fe/toast';

import type { PlfeResponse } from 'pl-fe/api';

const messages = defineMessages({
  bioPlaceholder: { id: 'onboarding.bio.placeholder', defaultMessage: 'Tell the world a little about yourself…' },
  error: { id: 'onboarding.error', defaultMessage: 'An unexpected error occurred. Please try again or skip this step.' },
});

const BioStep = ({ onNext }: { onNext: () => void }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { account } = useOwnAccount();
  const [value, setValue] = React.useState<string>(account?.__meta.source?.note ?? '');
  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  const handleSubmit = () => {
    setSubmitting(true);

    const credentials = dispatch(patchMe({ note: value }));

    Promise.all([credentials])
      .then(() => {
        setSubmitting(false);
        onNext();
      }).catch((error: { response: PlfeResponse }) => {
        setSubmitting(false);

        if (error.response?.status === 422) {
          setErrors([error.response.json.error.replace('Validation failed: ', '')]);
        } else {
          toast.error(messages.error);
        }
      });
  };

  return (
    <BigCard
      title={<FormattedMessage id='onboarding.note.title' defaultMessage='Write a short bio' />}
      subtitle={<FormattedMessage id='onboarding.note.subtitle' defaultMessage='You can always edit this later.' />}
    >
      <Stack space={5}>
        <div>
          <FormGroup
            hintText={<FormattedMessage id='onboarding.bio.hint' defaultMessage='Max 500 characters' />}
            labelText={<FormattedMessage id='edit_profile.fields.bio_label' defaultMessage='Bio' />}
            errors={errors}
          >
            <Textarea
              onChange={(event) => setValue(event.target.value)}
              placeholder={intl.formatMessage(messages.bioPlaceholder)}
              value={value}
              maxLength={500}
            />
          </FormGroup>
        </div>

        <div>
          <Stack justifyContent='center' space={2}>
            <Button
              block
              theme='primary'
              type='submit'
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <FormattedMessage id='onboarding.saving' defaultMessage='Saving…' />
              ) : (
                <FormattedMessage id='onboarding.next' defaultMessage='Next' />
              )}
            </Button>

            <Button block theme='tertiary' type='button' onClick={onNext}>
              <FormattedMessage id='onboarding.skip' defaultMessage='Skip for now' />
            </Button>
          </Stack>
        </div>
      </Stack>
    </BigCard>
  );
};

export { BioStep as default };
