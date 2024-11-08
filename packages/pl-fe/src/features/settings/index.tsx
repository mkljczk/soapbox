import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchMfa } from 'pl-fe/actions/mfa';
import List, { ListItem } from 'pl-fe/components/list';
import Card, { CardBody, CardHeader, CardTitle } from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import Text from 'pl-fe/components/ui/text';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';

import Preferences from '../preferences';

import MessagesSettings from './components/messages-settings';

const any = (arr: Array<any>): boolean => arr.some(Boolean);

const messages = defineMessages({
  accountAliases: { id: 'navigation_bar.account_aliases', defaultMessage: 'Account aliases' },
  accountMigration: { id: 'settings.account_migration', defaultMessage: 'Move Account' },
  backups: { id: 'column.backups', defaultMessage: 'Backups' },
  blocks: { id: 'settings.blocks', defaultMessage: 'Blocks' },
  changeEmail: { id: 'settings.change_email', defaultMessage: 'Change email' },
  changePassword: { id: 'settings.change_password', defaultMessage: 'Change password' },
  configureMfa: { id: 'settings.configure_mfa', defaultMessage: 'Configure MFA' },
  deleteAccount: { id: 'settings.delete_account', defaultMessage: 'Delete account' },
  domainBlocks: { id: 'navigation_bar.domain_blocks', defaultMessage: 'Domain blocks' },
  editProfile: { id: 'settings.edit_profile', defaultMessage: 'Edit profile' },
  exportData: { id: 'column.export_data', defaultMessage: 'Export data' },
  filters: { id: 'navigation_bar.filters', defaultMessage: 'Filters' },
  importData: { id: 'navigation_bar.import_data', defaultMessage: 'Import data' },
  interactionPolicies: { id: 'column.interaction_policies', defaultMessage: 'Interaction policies' },
  mfaDisabled: { id: 'mfa.disabled', defaultMessage: 'Disabled' },
  mfaEnabled: { id: 'mfa.enabled', defaultMessage: 'Enabled' },
  mutes: { id: 'settings.mutes', defaultMessage: 'Mutes' },
  mutesAndBlocks: { id: 'settings.mutes_blocks', defaultMessage: 'Mutes and blocks' },
  other: { id: 'settings.other', defaultMessage: 'Other options' },
  preferences: { id: 'settings.preferences', defaultMessage: 'Preferences' },
  profile: { id: 'settings.profile', defaultMessage: 'Profile' },
  security: { id: 'settings.security', defaultMessage: 'Security' },
  sessions: { id: 'settings.sessions', defaultMessage: 'Active sessions' },
  settings: { id: 'settings.settings', defaultMessage: 'Settings' },
});

/** User settings page. */
const Settings = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const mfa = useAppSelector((state) => state.security.mfa);
  const features = useFeatures();
  const { account } = useOwnAccount();

  const isMfaEnabled = mfa.settings?.totp;

  useEffect(() => {
    if (features.manageMfa) dispatch(fetchMfa());
  }, [dispatch]);

  if (!account) return null;

  const displayName = account.display_name || account.username;

  return (
    <Column label={intl.formatMessage(messages.settings)} transparent withHeader={false}>
      <Card className='space-y-4' variant='rounded'>
        <CardHeader>
          <CardTitle title={intl.formatMessage(messages.profile)} />
        </CardHeader>

        <CardBody>
          <List>
            <ListItem label={intl.formatMessage(messages.editProfile)} to='/settings/profile'>
              <span className='max-w-full truncate'>{displayName}</span>
            </ListItem>
          </List>
        </CardBody>

        <CardHeader>
          <CardTitle title={intl.formatMessage(messages.mutesAndBlocks)} />
        </CardHeader>

        <CardBody>
          <List>
            <ListItem label={intl.formatMessage(messages.mutes)} to='/mutes' />
            <ListItem label={intl.formatMessage(messages.blocks)} to='/blocks' />
            {(features.filters || features.filtersV2) && <ListItem label={intl.formatMessage(messages.filters)} to='/filters' />}
            {features.federating && <ListItem label={intl.formatMessage(messages.domainBlocks)} to='/domain_blocks' />}
            {features.interactionRequests && <ListItem label={intl.formatMessage(messages.interactionPolicies)} to='/settings/interaction_policies' />}
          </List>
        </CardBody>

        {any([
          features.changeEmail,
          features.changePassword,
          features.manageMfa,
          features.sessions,
        ]) && (
          <>
            <CardHeader>
              <CardTitle title={intl.formatMessage(messages.security)} />
            </CardHeader>

            <CardBody>
              <List>
                {features.changeEmail && <ListItem label={intl.formatMessage(messages.changeEmail)} to='/settings/email' />}
                {features.changePassword && <ListItem label={intl.formatMessage(messages.changePassword)} to='/settings/password' />}
                {features.manageMfa && (
                  <>
                    <ListItem label={intl.formatMessage(messages.configureMfa)} to='/settings/mfa'>
                      <span>
                        {isMfaEnabled ?
                          intl.formatMessage(messages.mfaEnabled) :
                          intl.formatMessage(messages.mfaDisabled)}
                      </span>
                    </ListItem>
                  </>
                )}
                {features.sessions && (
                  <ListItem label={intl.formatMessage(messages.sessions)} to='/settings/tokens' />
                )}
              </List>
            </CardBody>
          </>
        )}

        {features.chats ? (
          <>
            <CardHeader>
              <CardTitle title={<FormattedMessage id='column.chats' defaultMessage='Chats' />} />
            </CardHeader>

            <CardBody>
              <MessagesSettings />
            </CardBody>
          </>
        ) : null}

        <CardHeader>
          <CardTitle title={intl.formatMessage(messages.preferences)} />
        </CardHeader>

        <CardBody>
          <Preferences />
        </CardBody>

        {any([
          features.importBlocks,
          features.importFollows,
          features.importMutes,
          features.exportData,
          features.accountBackups,
          features.federating && features.accountMoving,
          features.federating && features.manageAccountAliases,
          features.deleteAccount,
        ]) && (
          <>
            <CardHeader>
              <CardTitle title={intl.formatMessage(messages.other)} />
            </CardHeader>

            <CardBody>
              <List>
                {(features.importBlocks || features.importFollows || features.importMutes) && (
                  <ListItem label={intl.formatMessage(messages.importData)} to='/settings/import' />
                )}

                {features.exportData && (
                  <ListItem label={intl.formatMessage(messages.exportData)} to='/settings/export' />
                )}

                {features.accountBackups && (
                  <ListItem label={intl.formatMessage(messages.backups)} to='/settings/backups' />
                )}

                {features.federating && (features.accountMoving ? (
                  <ListItem label={intl.formatMessage(messages.accountMigration)} to='/settings/migration' />
                ) : features.manageAccountAliases && (
                  <ListItem label={intl.formatMessage(messages.accountAliases)} to='/settings/aliases' />
                ))}

                {features.deleteAccount && (
                  <ListItem label={<Text theme='danger'>{intl.formatMessage(messages.deleteAccount)}</Text>} to='/settings/account' />
                )}
              </List>
            </CardBody>
          </>
        )}
      </Card>
    </Column>
  );
};

export { Settings as default };
