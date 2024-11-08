import React from 'react';

import Stack from 'pl-fe/components/ui/stack';
import Widget from 'pl-fe/components/ui/widget';

import ProfileField from '../profile-field';

import type { Account } from 'pl-fe/normalizers/account';

interface IProfileFieldsPanel {
  account: Pick<Account, 'emojis' | 'fields'>;
}

/** Custom profile fields for sidebar. */
const ProfileFieldsPanel: React.FC<IProfileFieldsPanel> = ({ account }) => (
  <Widget>
    <Stack space={4}>
      {account.fields.map((field, i) => (
        <ProfileField field={field} key={i} emojis={account.emojis} />
      ))}
    </Stack>
  </Widget>
);

export { ProfileFieldsPanel as default };
