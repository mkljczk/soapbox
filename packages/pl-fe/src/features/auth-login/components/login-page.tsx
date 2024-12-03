import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';

import { logIn, verifyCredentials, switchAccount } from 'pl-fe/actions/auth';
import { BigCard } from 'pl-fe/components/big-card';
import Button from 'pl-fe/components/ui/button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useModalsStore } from 'pl-fe/stores/modals';
import { getRedirectUrl } from 'pl-fe/utils/redirect';
import { isStandalone } from 'pl-fe/utils/state';

import ConsumersList from './consumers-list';
import LoginForm from './login-form';
import OtpAuthForm from './otp-auth-form';

import type { PlfeResponse } from 'pl-fe/api';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const { closeModal } = useModalsStore();

  const me = useAppSelector((state) => state.me);
  const standalone = useAppSelector((state) => isStandalone(state));

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
      .then(({ access_token }) => dispatch(verifyCredentials(access_token)))
      .then((account: { id: string }) => {
        closeModal();
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

  if (standalone) return <Redirect to='/login/external' />;

  if (shouldRedirect) {
    const redirectUri = getRedirectUrl();
    return <Redirect to={redirectUri} />;
  }

  if (mfaAuthNeeded) return <OtpAuthForm mfa_token={mfaToken} />;

  return (
    <BigCard title={<FormattedMessage id='login_form.header' defaultMessage='Sign in' />}>
      <Stack space={4}>
        <LoginForm handleSubmit={handleSubmit} isLoading={isLoading} />
        <ConsumersList />

        <div className={'flex items-center gap-2.5 before:flex-1 before:border-b before:border-gray-300 before:content-[\'\'] after:flex-1 after:border-b after:border-gray-300 after:content-[\'\'] before:dark:border-gray-800 after:dark:border-gray-800'}>
          <Text align='center'>
            <FormattedMessage id='login_form.divider' defaultMessage='or' />
          </Text>
        </div>

        <Button className='w-full' theme='secondary' to='/login/external'>
          <FormattedMessage id='login_form.external' defaultMessage='Sign in from remote instance' />
        </Button>
      </Stack>
    </BigCard>
  );
};

export { LoginPage as default };
