import { useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { logIn, switchAccount, verifyCredentials } from 'pl-fe/actions/auth';
import { fetchInstance } from 'pl-fe/actions/instance';
import Button from 'pl-fe/components/ui/button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import LoginForm from 'pl-fe/features/auth-login/components/login-form';
import OtpAuthForm from 'pl-fe/features/auth-login/components/otp-auth-form';
import ExternalLoginForm from 'pl-fe/features/external-login/components/external-login-form';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useRegistrationStatus } from 'pl-fe/hooks/use-registration-status';
import { getRedirectUrl } from 'pl-fe/utils/redirect';
import { isStandalone } from 'pl-fe/utils/state';

import type { PlfeResponse } from 'pl-fe/api';

const SignUpPanel = () => {
  const dispatch = useAppDispatch();
  const instance = useInstance();
  const { isOpen } = useRegistrationStatus();
  const me = useAppSelector((state) => state.me);
  const standalone = useAppSelector(isStandalone);

  const navigate = useNavigate();

  const token = new URLSearchParams(window.location.search).get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [mfaAuthNeeded, setMfaAuthNeeded] = useState(!!token);
  const [mfaToken, setMfaToken] = useState(token || '');
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const getFormData = (form: HTMLFormElement) =>
    Object.fromEntries(
      Array.from(form).map((i: any) => [i.name, i.value]),
    );

  const handleSubmit: React.FormEventHandler = (event) => {
    const { username, password } = getFormData(event.target as HTMLFormElement);
    dispatch(logIn(username, password))
      .then(({ access_token }) => dispatch(verifyCredentials(access_token as string)))
      // Refetch the instance for authenticated fetch
      .then(async (account) => {
        await dispatch(fetchInstance());
        return account;
      })
      .then((account: { id: string }) => {
        if (typeof me === 'string') {
          dispatch(switchAccount(account.id));
        } else {
          setShouldRedirect(true);
        }
      }).catch((error: { response: PlfeResponse }) => {
        const data: any = error.response?.json;
        if (data?.error === 'mfa_required') {
          setMfaAuthNeeded(true);
          setMfaToken(data.mfa_token);
        }
        setIsLoading(false);
      });
    setIsLoading(true);
    event.preventDefault();
  };

  if (shouldRedirect) {
    const redirectUri = getRedirectUrl();
    navigate({ to: redirectUri });
    return null;
    // return <Redirect to={redirectUri} />;
  }

  if (mfaAuthNeeded) return <OtpAuthForm mfa_token={mfaToken} small />;

  if (me) return null;

  return (
    <Stack space={2} data-testid='sign-up-panel'>
      {isOpen && (
        <>
          <Stack>
            <Text size='lg' weight='bold'>
              <FormattedMessage id='signup_panel.title' defaultMessage='New to {site_title}?' values={{ site_title: instance.title }} />
            </Text>

            <Text theme='muted' size='sm'>
              <FormattedMessage id='signup_panel.subtitle' defaultMessage="Sign up now to discuss what's happening." />
            </Text>
          </Stack>

          <Button
            theme='primary'
            to='/signup'
            block
          >
            <FormattedMessage id='account.register' defaultMessage='Sign up' />
          </Button>
        </>
      )}

      {standalone ? (
        <>
          <Text size='lg' weight='bold'>
            <FormattedMessage id='signup_panel.sign_in.title.external' defaultMessage='Sign in to external instance' />
          </Text>
          <ExternalLoginForm />
        </>
      ) : (
        <>
          <Text size='lg' weight='bold'>
            {isOpen ? (
              <FormattedMessage id='signup_panel.sign_in.title' defaultMessage='Sign in' />
            ) : (
              <FormattedMessage id='signup_panel.sign_in.title.or' defaultMessage='Already have an account?' />
            )}
          </Text>

          <LoginForm handleSubmit={handleSubmit} isLoading={isLoading} />
        </>
      )}
    </Stack>
  );
};

export { SignUpPanel as default };
