import React, { useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { remoteInteraction } from 'pl-fe/actions/interactions';
import Button from 'pl-fe/components/ui/button';
import Form from 'pl-fe/components/ui/form';
import Input from 'pl-fe/components/ui/input';
import Modal from 'pl-fe/components/ui/modal';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useRegistrationStatus } from 'pl-fe/hooks/use-registration-status';
import { selectAccount } from 'pl-fe/selectors';
import toast from 'pl-fe/toast';

import type { BaseModalProps } from '../modal-root';

const messages = defineMessages({
  accountPlaceholder: { id: 'remote_interaction.account_placeholder', defaultMessage: 'Enter your username@domain you want to act from' },
  userNotFoundError: { id: 'remote_interaction.user_not_found_error', defaultMessage: 'Couldn\'t find given user' },
});

type UnauthorizedModalAction = 'FOLLOW' | 'REPLY' | 'REBLOG' | 'FAVOURITE' | 'DISLIKE' | 'POLL_VOTE' | 'JOIN';

interface UnauthorizedModalProps {
  /** Unauthorized action type. */
  action?: UnauthorizedModalAction;
  /** ActivityPub ID of the account OR status being acted upon. */
  ap_id?: string;
  /** Account ID of the account being acted upon. */
  account?: string;
}

/** Modal to display when a logged-out user tries to do something that requires login. */
const UnauthorizedModal: React.FC<UnauthorizedModalProps & BaseModalProps> = ({ action, onClose, account: accountId, ap_id: apId }) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const instance = useInstance();
  const { isOpen } = useRegistrationStatus();

  const username = useAppSelector(state => selectAccount(state, accountId!)?.display_name);
  const features = useFeatures();

  const [account, setAccount] = useState('');

  const onAccountChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setAccount(e.target.value);
  };

  const onClickClose = () => {
    onClose('UNAUTHORIZED');
  };

  const onSubmit: React.FormEventHandler = e => {
    e.preventDefault();

    dispatch(remoteInteraction(apId!, account))
      .then(url => {
        window.open(url, '_new', 'noopener,noreferrer');
        onClose('UNAUTHORIZED');
      })
      .catch(error => {
        if (error.message === 'Couldn\'t find user') {
          toast.error(intl.formatMessage(messages.userNotFoundError));
        }
      });
  };

  const onLogin = () => {
    history.push('/login');
    onClickClose();
  };

  const onRegister = () => {
    history.push('/signup');
    onClickClose();
  };

  const renderRemoteInteractions = () => {
    let header;
    let button;

    if (action === 'FOLLOW') {
      header = <FormattedMessage id='remote_interaction.follow_title' defaultMessage='Follow {user} remotely' values={{ user: username }} />;
      button = <FormattedMessage id='remote_interaction.follow' defaultMessage='Proceed to follow' />;
    } else if (action === 'REPLY') {
      header = <FormattedMessage id='remote_interaction.reply_title' defaultMessage='Reply to a post remotely' />;
      button = <FormattedMessage id='remote_interaction.reply' defaultMessage='Proceed to reply' />;
    } else if (action === 'REBLOG') {
      header = <FormattedMessage id='remote_interaction.reblog_title' defaultMessage='Reblog a post remotely' />;
      button = <FormattedMessage id='remote_interaction.reblog' defaultMessage='Proceed to repost' />;
    } else if (action === 'FAVOURITE') {
      header = <FormattedMessage id='remote_interaction.favourite_title' defaultMessage='Like a post remotely' />;
      button = <FormattedMessage id='remote_interaction.favourite' defaultMessage='Proceed to like' />;
    } else if (action === 'DISLIKE') {
      header = <FormattedMessage id='remote_interaction.dislike_title' defaultMessage='Dislike a post remotely' />;
      button = <FormattedMessage id='remote_interaction.dislike' defaultMessage='Proceed to dislike' />;
    } else if (action === 'POLL_VOTE') {
      header = <FormattedMessage id='remote_interaction.poll_vote_title' defaultMessage='Vote in a poll remotely' />;
      button = <FormattedMessage id='remote_interaction.poll_vote' defaultMessage='Proceed to vote' />;
    } else if (action === 'JOIN') {
      header = <FormattedMessage id='remote_interaction.event_join_title' defaultMessage='Join an event remotely' />;
      button = <FormattedMessage id='remote_interaction.event_join' defaultMessage='Proceed to join' />;
    }

    return (
      <Modal
        title={header}
        onClose={onClickClose}
        confirmationAction={onLogin}
        confirmationText={<FormattedMessage id='account.login' defaultMessage='Log in' />}
        secondaryAction={isOpen ? onRegister : undefined}
        secondaryText={isOpen ? <FormattedMessage id='account.register' defaultMessage='Sign up' /> : undefined}
      >
        <div className='flex flex-col gap-2.5'>
          <Form className='flex w-full flex-col gap-2.5' onSubmit={onSubmit}>
            <Input
              placeholder={intl.formatMessage(messages.accountPlaceholder)}
              name='remote_follow[acct]'
              value={account}
              autoCorrect='off'
              autoCapitalize='off'
              onChange={onAccountChange}
              required
            />
            <Button className='self-end' type='submit' theme='primary'>{button}</Button>
          </Form>
          <div className={'-mx-2.5 my-0 flex items-center gap-2.5 before:flex-1 before:border-b before:border-gray-300 before:content-[\'\'] after:flex-1 after:border-b after:border-gray-300 after:content-[\'\'] before:dark:border-gray-600 after:dark:border-gray-600'}>
            <Text align='center'>
              <FormattedMessage id='remote_interaction.divider' defaultMessage='or' />
            </Text>
          </div>
          {isOpen && (
            <Text size='lg' weight='medium'>
              <FormattedMessage id='unauthorized_modal.title' defaultMessage='Sign up for {site_title}' values={{ site_title: instance.title }} />
            </Text>
          )}
        </div>
      </Modal>
    );
  };

  if (action && features.remoteInteractions && features.federating) {
    return renderRemoteInteractions();
  }

  return (
    <Modal
      title={<FormattedMessage id='unauthorized_modal.title' defaultMessage='Sign up for {site_title}' values={{ site_title: instance.title }} />}
      onClose={onClickClose}
      confirmationAction={onLogin}
      confirmationText={<FormattedMessage id='account.login' defaultMessage='Log in' />}
      secondaryAction={isOpen ? onRegister : undefined}
      secondaryText={isOpen ? <FormattedMessage id='account.register' defaultMessage='Sign up' /> : undefined}
    >
      <Stack>
        <Text>
          <FormattedMessage id='unauthorized_modal.text' defaultMessage='You need to be logged in to do that.' />
        </Text>
      </Stack>
    </Modal>
  );
};

export { type UnauthorizedModalAction, type UnauthorizedModalProps, UnauthorizedModal as default };
