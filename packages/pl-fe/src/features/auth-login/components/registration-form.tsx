import { Map as ImmutableMap } from 'immutable';
import debounce from 'lodash/debounce';
import React, { useState, useRef, useCallback } from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { accountLookup } from 'pl-fe/actions/accounts';
import { register, verifyCredentials } from 'pl-fe/actions/auth';
import BirthdayInput from 'pl-fe/components/birthday-input';
import Button from 'pl-fe/components/ui/button';
import Checkbox from 'pl-fe/components/ui/checkbox';
import Form from 'pl-fe/components/ui/form';
import FormActions from 'pl-fe/components/ui/form-actions';
import FormGroup from 'pl-fe/components/ui/form-group';
import Input from 'pl-fe/components/ui/input';
import Select from 'pl-fe/components/ui/select';
import Textarea from 'pl-fe/components/ui/textarea';
import CaptchaField from 'pl-fe/features/auth-login/components/captcha';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useSettings } from 'pl-fe/hooks/use-settings';
import { useModalsStore } from 'pl-fe/stores/modals';

import type { CreateAccountParams } from 'pl-api';

const messages = defineMessages({
  username: { id: 'registration.fields.username_placeholder', defaultMessage: 'Username' },
  username_hint: { id: 'registration.fields.username_hint', defaultMessage: 'Only letters, numbers, and underscores are allowed.' },
  usernameUnavailable: { id: 'registration.username_unavailable', defaultMessage: 'Username is already taken.' },
  email: { id: 'registration.fields.email_placeholder', defaultMessage: 'E-mail address' },
  password: { id: 'registration.fields.password_placeholder', defaultMessage: 'Password' },
  passwordMismatch: { id: 'registration.password_mismatch', defaultMessage: 'Passwords don\'t match.' },
  confirm: { id: 'registration.fields.confirm_placeholder', defaultMessage: 'Password (again)' },
  agreement: { id: 'registration.agreement', defaultMessage: 'I agree to the {tos}.' },
  tos: { id: 'registration.tos', defaultMessage: 'Terms of Service' },
  close: { id: 'registration.confirmation_modal.close', defaultMessage: 'Close' },
  newsletter: { id: 'registration.newsletter', defaultMessage: 'Subscribe to newsletter.' },
  needsConfirmationHeader: { id: 'confirmations.register.needs_confirmation.header', defaultMessage: 'Confirmation needed' },
  needsApprovalHeader: { id: 'confirmations.register.needs_approval.header', defaultMessage: 'Approval needed' },
  reasonHint: { id: 'registration.reason_hint', defaultMessage: 'This will help us review your application' },
});

interface IRegistrationForm {
  inviteToken?: string;
}

/** Allows the user to sign up for the website. */
const RegistrationForm: React.FC<IRegistrationForm> = ({ inviteToken }) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const { locale } = useSettings();
  const features = useFeatures();
  const instance = useInstance();
  const { openModal } = useModalsStore();

  const needsConfirmation = instance.pleroma.metadata.account_activation_required;
  const needsApproval = instance.registrations.approval_required;
  const supportsAccountLookup = features.accountLookup;
  const birthdayRequired = instance.pleroma.metadata.birthday_required;
  const domains = instance.pleroma.metadata.multitenancy.enabled ? instance.pleroma.metadata.multitenancy.domains!.filter((domain) => domain.public) : undefined;

  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [params, setParams] = useState<CreateAccountParams>({
    username: '',
    email: '',
    password: '',
    agreement: false,
    locale: '',
  });
  const [captchaIdempotencyKey, setCaptchaIdempotencyKey] = useState(crypto.randomUUID());
  const [usernameUnavailable, setUsernameUnavailable] = useState(false);
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const controller = useRef(new AbortController());

  const onInputChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = e => {
    setParams(params => ({ ...params, [e.target.name]: e.target.value }));
  };

  const onUsernameChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setParams(params => ({ ...params, username: e.target.value }));
    setUsernameUnavailable(false);
    controller.current.abort();
    controller.current = new AbortController();

    const domain = params.domain;
    usernameAvailable(e.target.value, domain ? domains!.find(({ id }) => id === domain)?.domain : undefined);
  };

  const onDomainChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    setParams(params => ({ ...params, domain: e.target.value || undefined }));
    setUsernameUnavailable(false);

    controller.current.abort();
    controller.current = new AbortController();

    const username = params.username;
    if (username) {
      usernameAvailable(username, domains!.find(({ id }) => id === e.target.value)?.domain);
    }
  };

  const onCheckboxChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setParams(params => ({ ...params, [e.target.name]: e.target.checked }));
  };

  const onPasswordChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const password = e.target.value;
    onInputChange(e);

    if (password === passwordConfirmation) {
      setPasswordMismatch(false);
    }
  };

  const onPasswordConfirmChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const password = params.password || '';
    const passwordConfirmation = e.target.value;
    setPasswordConfirmation(passwordConfirmation);

    if (password === passwordConfirmation) {
      setPasswordMismatch(false);
    }
  };

  const onPasswordConfirmBlur: React.ChangeEventHandler<HTMLInputElement> = () => {
    setPasswordMismatch(!passwordsMatch());
  };

  const onBirthdayChange = (birthday: string) => {
    setParams(params => ({ ...params, birthday }));
  };

  const launchModal = () => {
    const message = (<>
      {needsConfirmation && <p>
        <FormattedMessage
          id='confirmations.register.needs_confirmation'
          defaultMessage='Please check your inbox at {email} for confirmation instructions. You will need to verify your email address to continue.'
          values={{ email: <strong>{params.email}</strong> }}
        /></p>}
      {needsApproval && <p>
        <FormattedMessage
          id='confirmations.register.needs_approval'
          defaultMessage='Your account will be manually approved by an admin. Please be patient while we review your details.'
        /></p>}
    </>);

    openModal('CONFIRM', {
      heading: needsConfirmation
        ? intl.formatMessage(messages.needsConfirmationHeader)
        : needsApproval
          ? intl.formatMessage(messages.needsApprovalHeader)
          : undefined,
      message,
      confirm: intl.formatMessage(messages.close),
      onConfirm: () => {},
    });
  };

  const postRegisterAction = ({ access_token }: any) => {
    if (needsConfirmation || needsApproval) {
      return launchModal();
    } else {
      return dispatch(verifyCredentials(access_token)).then(() => {
        history.push('/');
      });
    }
  };

  const passwordsMatch = () => params.password === passwordConfirmation;

  const usernameAvailable = useCallback(debounce((username, domain?: string) => {
    if (!supportsAccountLookup) return;

    controller.current.abort();
    controller.current = new AbortController();

    dispatch(accountLookup(`${username}${domain ? `@${domain}` : ''}`, controller.current.signal))
      .then(account => {
        setUsernameUnavailable(!!account);
      })
      .catch((error) => {
        if (error.response?.status === 404) {
          setUsernameUnavailable(false);
        }
      });
  }, 1000, { trailing: true }), []);

  const onSubmit: React.FormEventHandler = () => {
    if (!passwordsMatch()) {
      setPasswordMismatch(true);
      return;
    }

    const normalParams = {
      ...params,
      locale,
    };

    if (inviteToken) {
      params.token = inviteToken;
    }

    setSubmissionLoading(true);

    dispatch(register(normalParams))
      .then(postRegisterAction)
      .catch(() => {
        setSubmissionLoading(false);
        refreshCaptcha();
      });
  };

  const onCaptchaClick: React.MouseEventHandler = () => {
    refreshCaptcha();
  };

  const onFetchCaptcha = (captcha: ImmutableMap<string, any>) => {
    setCaptchaLoading(false);
    setParams(params => ({
      ...params,
      captcha_token: captcha.get('token'),
      captcha_answer_data: captcha.get('answer_data'),
    }));
  };

  const onFetchCaptchaFail = () => {
    setCaptchaLoading(false);
  };

  const refreshCaptcha = () => {
    setCaptchaIdempotencyKey(crypto.randomUUID());
    setParams(params => ({ ...params, captcha_solution: '' }));
  };

  const isLoading = captchaLoading || submissionLoading;

  return (
    <Form onSubmit={onSubmit} data-testid='registrations-open'>
      <fieldset disabled={isLoading} className='space-y-3'>
        <>
          <FormGroup
            hintText={intl.formatMessage(messages.username_hint)}
            errors={usernameUnavailable ? [intl.formatMessage(messages.usernameUnavailable)] : undefined}
          >
            <Input
              type='text'
              name='username'
              placeholder={intl.formatMessage(messages.username)}
              autoComplete='off'
              autoCorrect='off'
              autoCapitalize='off'
              pattern='^[a-zA-Z\d_-]+'
              icon={require('@fluentui/mention_24_regular.svg')}
              onChange={onUsernameChange}
              value={params.username}
              required
            />
          </FormGroup>

          {domains && (
            <FormGroup>
              <Select
                onChange={onDomainChange}
                value={params.domain}
              >
                {domains.map(({ id, domain }) => (
                  <option key={id} value={id}>{domain}</option>
                ))}
              </Select>
            </FormGroup>
          )}

          <Input
            type='email'
            name='email'
            placeholder={intl.formatMessage(messages.email)}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            onChange={onInputChange}
            value={params.email}
            required
          />

          <Input
            type='password'
            name='password'
            placeholder={intl.formatMessage(messages.password)}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            onChange={onPasswordChange}
            value={params.password}
            required
          />

          <FormGroup
            errors={passwordMismatch ? [intl.formatMessage(messages.passwordMismatch)] : undefined}
          >
            <Input
              type='password'
              name='password_confirmation'
              placeholder={intl.formatMessage(messages.confirm)}
              autoComplete='off'
              autoCorrect='off'
              autoCapitalize='off'
              onChange={onPasswordConfirmChange}
              onBlur={onPasswordConfirmBlur}
              value={passwordConfirmation}
              required
            />
          </FormGroup>

          {birthdayRequired && (
            <BirthdayInput
              value={params.birthday || ''}
              onChange={onBirthdayChange}
              required
            />
          )}

          {needsApproval && (
            <FormGroup
              labelText={<FormattedMessage id='registration.reason' defaultMessage='Why do you want to join?' />}
            >
              <Textarea
                name='reason'
                placeholder={intl.formatMessage(messages.reasonHint)}
                maxLength={500}
                onChange={onInputChange}
                value={params.reason || ''}
                autoGrow
                required
              />
            </FormGroup>
          )}

          <CaptchaField
            onFetch={onFetchCaptcha}
            onFetchFail={onFetchCaptchaFail}
            onChange={onInputChange}
            onClick={onCaptchaClick}
            idempotencyKey={captchaIdempotencyKey}
            name='captcha_solution'
            value={params.captcha_solution || ''}
          />

          <FormGroup
            labelText={intl.formatMessage(messages.agreement, { tos: <Link to='/about/tos' target='_blank' key={0}>{intl.formatMessage(messages.tos)}</Link> })}
          >
            <Checkbox
              name='agreement'
              onChange={onCheckboxChange}
              checked={params.agreement}
              required
            />
          </FormGroup>

          <FormActions>
            <Button type='submit'>
              <FormattedMessage id='registration.sign_up' defaultMessage='Sign up' />
            </Button>
          </FormActions>
        </>
      </fieldset>
    </Form>
  );
};

export { RegistrationForm as default };
