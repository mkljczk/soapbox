import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { patchMe } from 'pl-fe/actions/me';
import { BigCard } from 'pl-fe/components/big-card';
import Button from 'pl-fe/components/ui/button';
import FormGroup from 'pl-fe/components/ui/form-group';
import Input from 'pl-fe/components/ui/input';
import Stack from 'pl-fe/components/ui/stack';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import toast from 'pl-fe/toast';

import type { PlfeResponse } from 'pl-fe/api';

const messages = defineMessages({
  usernamePlaceholder: { id: 'onboarding.display_name.placeholder', defaultMessage: 'Eg. John Smith' },
  error: { id: 'onboarding.error', defaultMessage: 'An unexpected error occurred. Please try again or skip this step.' },
});

const DisplayNameStep = ({ onNext }: { onNext: () => void }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { account } = useOwnAccount();
  const [value, setValue] = React.useState<string>(account?.display_name || '');
  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  const trimmedValue = value.trim();
  const isValid = trimmedValue.length > 0;
  const isDisabled = !isValid || value.length > 30;

  const hintText = React.useMemo(() => {
    const charsLeft = 30 - value.length;
    const suffix = charsLeft === 1 ? 'character remaining' : 'characters remaining';

    return `${charsLeft} ${suffix}`;
  }, [value]);

  const handleSubmit = () => {
    setSubmitting(true);

    const credentials = dispatch(patchMe({ display_name: value }));

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
      title={<FormattedMessage id='onboarding.display_name.title' defaultMessage='Choose a display name' />}
      subtitle={<FormattedMessage id='onboarding.display_name.subtitle' defaultMessage='You can always edit this later.' />}
    >
      <Stack space={5}>
        <FormGroup
          hintText={hintText}
          labelText={<FormattedMessage id='onboarding.display_name.label' defaultMessage='Display name' />}
          errors={errors}
        >
          <Input
            onChange={(event) => setValue(event.target.value)}
            placeholder={intl.formatMessage(messages.usernamePlaceholder)}
            type='text'
            value={value}
            maxLength={30}
          />
        </FormGroup>

        <Stack justifyContent='center' space={2}>
          <Button
            block
            theme='primary'
            type='submit'
            disabled={isDisabled || isSubmitting}
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
      </Stack>
    </BigCard>
  );
};

export { DisplayNameStep as default };
