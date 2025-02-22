import { PLEROMA } from 'pl-api';
import React, { ChangeEventHandler, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { setBadges as saveBadges } from 'pl-fe/actions/admin';
import { deactivateUserModal, deleteUserModal } from 'pl-fe/actions/moderation';
import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import { useSuggest } from 'pl-fe/api/hooks/admin/use-suggest';
import { useVerify } from 'pl-fe/api/hooks/admin/use-verify';
import Account from 'pl-fe/components/account';
import List, { ListItem } from 'pl-fe/components/list';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import OutlineBox from 'pl-fe/components/outline-box';
import Button from 'pl-fe/components/ui/button';
import HStack from 'pl-fe/components/ui/hstack';
import Modal from 'pl-fe/components/ui/modal';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Toggle from 'pl-fe/components/ui/toggle';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import toast from 'pl-fe/toast';
import { getBadges } from 'pl-fe/utils/badges';

import BadgeInput from './badge-input';
import StaffRolePicker from './staff-role-picker';

import type { BaseModalProps } from '../../modal-root';

const messages = defineMessages({
  userVerified: { id: 'admin.users.user_verified_message', defaultMessage: '@{acct} was verified' },
  userUnverified: { id: 'admin.users.user_unverified_message', defaultMessage: '@{acct} was unverified' },
  userSuggested: { id: 'admin.users.user_suggested_message', defaultMessage: '@{acct} was suggested' },
  userUnsuggested: { id: 'admin.users.user_unsuggested_message', defaultMessage: '@{acct} was unsuggested' },
  badgesSaved: { id: 'admin.users.badges_saved_message', defaultMessage: 'Custom badges updated.' },
});

interface AccountModerationModalProps {
  /** ID of the account to moderate. */
  accountId: string;
}

/** Moderator actions against accounts. */
const AccountModerationModal: React.FC<AccountModerationModalProps & BaseModalProps> = ({ onClose, accountId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { suggest, unsuggest } = useSuggest();
  const { verify, unverify } = useVerify();
  const { account: ownAccount } = useOwnAccount();
  const features = useFeatures();
  const { account } = useAccount(accountId);

  const accountBadges = account ? getBadges(account) : [];
  const [badges, setBadges] = useState<string[]>(accountBadges);

  const handleClose = () => onClose('ACCOUNT_MODERATION');

  if (!account || !ownAccount) {
    return (
      <Modal onClose={handleClose}>
        <MissingIndicator />
      </Modal>
    );
  }

  const handleAdminFE = () => {
    window.open(`/pleroma/admin/#/users/${account.id}/`, '_blank');
  };

  const handleVerifiedChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { checked } = e.target;

    const message = checked ? messages.userVerified : messages.userUnverified;
    const action = checked ? verify : unverify;

    action(account.id, {
      onSuccess: () => toast.success(intl.formatMessage(message, { acct: account.acct })),
    });
  };

  const handleSuggestedChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { checked } = e.target;

    const message = checked ? messages.userSuggested : messages.userUnsuggested;
    const action = checked ? suggest : unsuggest;

    action(account.id, {
      onSuccess: () => toast.success(intl.formatMessage(message, { acct: account.acct })),
    });
  };

  const handleDeactivate = () => {
    dispatch(deactivateUserModal(intl, account.id));
  };

  const handleDelete = () => {
    dispatch(deleteUserModal(intl, account.id));
  };

  const handleSaveBadges = () => {
    dispatch(saveBadges(account.id, accountBadges, badges))
      .then(() => toast.success(intl.formatMessage(messages.badgesSaved)))
      .catch(() => {});
  };

  return (
    <Modal
      title={<FormattedMessage id='account_moderation_modal.title' defaultMessage='Moderate @{acct}' values={{ acct: account.acct }} />}
      onClose={handleClose}
    >
      <Stack space={4}>
        <OutlineBox>
          <Account
            account={account}
            showAccountHoverCard={false}
            withLinkToProfile={false}
            hideActions
          />
        </OutlineBox>

        <List>
          {(ownAccount.is_admin && account.local) && (
            <ListItem label={<FormattedMessage id='account_moderation_modal.fields.account_role' defaultMessage='Staff level' />}>
              <div className='w-auto'>
                <StaffRolePicker account={account} />
              </div>
            </ListItem>
          )}

          {features.pleromaAdminAccounts && (
            <ListItem label={<FormattedMessage id='account_moderation_modal.fields.verified' defaultMessage='Verified account' />}>
              <Toggle
                checked={account.verified}
                onChange={handleVerifiedChange}
              />
            </ListItem>
          )}

          {features.suggestionsV2 && (
            <ListItem label={<FormattedMessage id='account_moderation_modal.fields.suggested' defaultMessage='Suggested in people to follow' />}>
              <Toggle
                checked={account.is_suggested === true}
                onChange={handleSuggestedChange}
              />
            </ListItem>
          )}

          {features.pleromaAdminAccounts && (
            <ListItem label={<FormattedMessage id='account_moderation_modal.fields.badges' defaultMessage='Custom badges' />}>
              <div className='grow'>
                <HStack className='w-full' alignItems='center' space={2}>
                  <BadgeInput badges={badges} onChange={setBadges} />
                  <Button onClick={handleSaveBadges}>
                    <FormattedMessage id='save' defaultMessage='Save' />
                  </Button>
                </HStack>
              </div>
            </ListItem>
          )}
        </List>

        <List>
          <ListItem
            label={<FormattedMessage id='account_moderation_modal.fields.deactivate' defaultMessage='Deactivate account' />}
            onClick={handleDeactivate}
          />

          <ListItem
            label={<FormattedMessage id='account_moderation_modal.fields.delete' defaultMessage='Delete account' />}
            onClick={handleDelete}
          />
        </List>

        <Text theme='subtle' size='xs'>
          <FormattedMessage
            id='account_moderation_modal.info.id'
            defaultMessage='ID: {id}'
            values={{ id: account.id }}
          />
        </Text>

        {features.version.software === PLEROMA && (
          <HStack justifyContent='center'>
            <Button icon={require('@tabler/icons/outline/external-link.svg')} size='sm' theme='secondary' onClick={handleAdminFE}>
              <FormattedMessage id='account_moderation_modal.admin_fe' defaultMessage='Open in AdminFE' />
            </Button>
          </HStack>
        )}
      </Stack>
    </Modal>
  );
};

export { type AccountModerationModalProps, AccountModerationModal as default };
