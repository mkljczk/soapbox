import React, { useState } from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';

import { createApp } from 'pl-fe/actions/apps';
import { obtainOAuthToken } from 'pl-fe/actions/oauth';
import Button from 'pl-fe/components/ui/button';
import Column from 'pl-fe/components/ui/column';
import Form from 'pl-fe/components/ui/form';
import FormActions from 'pl-fe/components/ui/form-actions';
import FormGroup from 'pl-fe/components/ui/form-group';
import Input from 'pl-fe/components/ui/input';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Textarea from 'pl-fe/components/ui/textarea';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { getBaseURL } from 'pl-fe/utils/accounts';

import type { Token } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.app_create', defaultMessage: 'Create app' },
  namePlaceholder: { id: 'app_create.name_placeholder', defaultMessage: 'e.g. \'pl-fe\'' },
  scopesPlaceholder: { id: 'app_create.scopes_placeholder', defaultMessage: 'e.g. \'read write follow\'' },
});

const BLANK_PARAMS = {
  client_name: '',
  redirect_uris: 'urn:ietf:wg:oauth:2.0:oob',
  scopes: '',
  website: '',
};

type Params = typeof BLANK_PARAMS;

const CreateApp: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { account } = useOwnAccount();

  const [app, setApp] = useState<Record<string, any> | null>(null);
  const [token, setToken] = useState<Token | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [params, setParams] = useState<Params>(BLANK_PARAMS);

  const handleCreateApp = () => {
    const baseURL = getBaseURL(account!);

    return dispatch(createApp(params, baseURL))
      .then(app => {
        setApp(app);
        return app;
      });
  };

  const handleCreateToken = (app: Record<string, string>) => {
    const baseURL = getBaseURL(account!);

    const tokenParams = {
      client_id:     app!.client_id,
      client_secret: app!.client_secret,
      redirect_uri:  params.redirect_uris,
      grant_type:    'client_credentials',
      scope:         params.scopes,
    };

    return dispatch(obtainOAuthToken(tokenParams, baseURL))
      .then(setToken);
  };

  const handleSubmit = () => {
    setLoading(true);

    handleCreateApp()
      .then(handleCreateToken)
      .then(() => {
        scrollToTop();
        setLoading(false);
      }).catch(error => {
        console.error(error);
        setLoading(false);
      });
  };

  const setParam = (key: string, value: string) => {
    setParams({ ...params, [key]: value });
  };

  const handleParamChange = (key: string): React.ChangeEventHandler<HTMLInputElement> => e => {
    setParam(key, e.target.value);
  };

  const resetState = () => {
    setApp(null);
    setToken(null);
    setLoading(false);
    setParams(BLANK_PARAMS);
  };

  const handleReset = () => {
    resetState();
    scrollToTop();
  };

  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderResults = () => (
    <Column label={intl.formatMessage(messages.heading)} backHref='/developers'>
      <Form>
        <Stack>
          <Text size='lg' weight='medium'>
            <FormattedMessage id='app_create.results.explanation_title' defaultMessage='App created successfully' />
          </Text>
          <Text theme='muted'>
            <FormattedMessage
              id='app_create.results.explanation_text'
              defaultMessage='You created a new app and token! Please copy the credentials somewhere; you will not see them again after navigating away from this page.'
            />
          </Text>
        </Stack>

        <FormGroup labelText={<FormattedMessage id='app_create.results.app_label' defaultMessage='App' />}>
          <Textarea
            value={JSON.stringify(app, null, 2)}
            rows={10}
            readOnly
            isCodeEditor
          />
        </FormGroup>

        <FormGroup labelText={<FormattedMessage id='app_create.results.token_label' defaultMessage='OAuth token' />}>
          <Textarea
            value={JSON.stringify(token, null, 2)}
            rows={10}
            readOnly
            isCodeEditor
          />
        </FormGroup>

        <FormActions>
          <Button theme='primary' type='button' onClick={handleReset}>
            <FormattedMessage id='app_create.restart' defaultMessage='Create another' />
          </Button>
        </FormActions>
      </Form>
    </Column>
  );

  if (app && token) {
    return renderResults();
  }

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref='/developers'>
      <Form onSubmit={handleSubmit}>
        <FormGroup labelText={<FormattedMessage id='app_create.name_label' defaultMessage='App name' />}>
          <Input
            type='text'
            placeholder={intl.formatMessage(messages.namePlaceholder)}
            onChange={handleParamChange('client_name')}
            value={params.client_name}
            required
          />
        </FormGroup>

        <FormGroup labelText={<FormattedMessage id='app_create.website_label' defaultMessage='Website' />}>
          <Input
            type='text'
            placeholder='https://github.com/mkljczk/pl-fe'
            onChange={handleParamChange('website')}
            value={params.website}
          />
        </FormGroup>

        <FormGroup labelText={<FormattedMessage id='app_create.redirect_uri_label' defaultMessage='Redirect URIs' />}>
          <Input
            type='text'
            placeholder='https://github.com/mkljczk/pl-fe'
            onChange={handleParamChange('redirect_uris')}
            value={params.redirect_uris}
            required
          />
        </FormGroup>

        <FormGroup labelText={<FormattedMessage id='app_create.scopes_label' defaultMessage='Scopes' />}>
          <Input
            type='text'
            placeholder={intl.formatMessage(messages.scopesPlaceholder)}
            onChange={handleParamChange('scopes')}
            value={params.scopes}
            required
          />
        </FormGroup>

        <FormActions>
          <Button theme='primary' type='submit' disabled={isLoading}>
            <FormattedMessage id='app_create.submit' defaultMessage='Create app' />
          </Button>
        </FormActions>
      </Form>
    </Column>
  );
};

export { CreateApp as default };
