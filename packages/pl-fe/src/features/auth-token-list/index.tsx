import React, { useEffect } from 'react';
import { defineMessages, FormattedDate, useIntl } from 'react-intl';

import { fetchOAuthTokens, revokeOAuthTokenById } from 'pl-fe/actions/security';
import Button from 'pl-fe/components/ui/button';
import Card, { CardBody, CardHeader, CardTitle } from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import HStack from 'pl-fe/components/ui/hstack';
import Spinner from 'pl-fe/components/ui/spinner';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useModalsStore } from 'pl-fe/stores/modals';

import type { OauthToken } from 'pl-api';

const messages = defineMessages({
  header: { id: 'security.headers.tokens', defaultMessage: 'Sessions' },
  revoke: { id: 'security.tokens.revoke', defaultMessage: 'Revoke' },
  revokeSessionHeading: { id: 'confirmations.revoke_session.heading', defaultMessage: 'Revoke current session' },
  revokeSessionMessage: { id: 'confirmations.revoke_session.message', defaultMessage: 'You are about to revoke your current session. You will be signed out.' },
  revokeSessionConfirm: { id: 'confirmations.revoke_session.confirm', defaultMessage: 'Revoke' },
});

interface IAuthToken {
  token: OauthToken;
  isCurrent: boolean;
}

const AuthToken: React.FC<IAuthToken> = ({ token, isCurrent }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { openModal } = useModalsStore();

  const handleRevoke = () => {
    if (isCurrent)
      openModal('CONFIRM', {
        heading: intl.formatMessage(messages.revokeSessionHeading),
        message: intl.formatMessage(messages.revokeSessionMessage),
        confirm: intl.formatMessage(messages.revokeSessionConfirm),
        onConfirm: () => {
          dispatch(revokeOAuthTokenById(token.id));
        },
      });
    else {
      dispatch(revokeOAuthTokenById(token.id));
    }
  };

  return (
    <div className='dark:bg-primary-800 rounded-lg bg-gray-100 p-4'>
      <Stack space={2}>
        <Stack>
          <Text size='md' weight='medium'>{token.app_name}</Text>
          {token.valid_until && (
            <Text size='sm' theme='muted'>
              <FormattedDate
                value={token.valid_until}
                hour12
                year='numeric'
                month='short'
                day='2-digit'
                hour='numeric'
                minute='2-digit'
              />
            </Text>
          )}
        </Stack>
        <HStack justifyContent='end'>
          <Button theme={isCurrent ? 'danger' : 'primary'} onClick={handleRevoke}>
            {intl.formatMessage(messages.revoke)}
          </Button>
        </HStack>
      </Stack>
    </div>
  );
};

const AuthTokenList: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const tokens = useAppSelector(state => state.security.tokens.toReversed());
  const currentTokenId = useAppSelector(state => {
    const currentToken = Object.values(state.auth.tokens).find((token) => token.me === state.auth.me);

    return currentToken?.id;
  });

  useEffect(() => {
    dispatch(fetchOAuthTokens());
  }, []);

  const body = tokens ? (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
      {tokens.map((token) => (
        <AuthToken key={token.id} token={token} isCurrent={String(token.id) === currentTokenId} />
      ))}
    </div>
  ) : <Spinner />;

  return (
    <Column label={intl.formatMessage(messages.header)} transparent withHeader={false}>
      <Card variant='rounded'>
        <CardHeader backHref='/settings'>
          <CardTitle title={intl.formatMessage(messages.header)} />
        </CardHeader>

        <CardBody>
          {body}
        </CardBody>
      </Card>
    </Column>
  );
};

export { AuthTokenList as default };
