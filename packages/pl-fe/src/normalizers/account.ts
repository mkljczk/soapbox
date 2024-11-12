import type { Account as BaseAccount } from 'pl-api';

const normalizeAccount = (account: BaseAccount) => {
  const missingAvatar = require('pl-fe/assets/images/avatar-missing.png');
  const missingHeader = require('pl-fe/assets/images/header-missing.png');

  return {
    mute_expires_at: null,
    ...account,
    avatar: account.avatar || account.avatar_static || missingAvatar,
    avatar_static: account.avatar_static || account.avatar || missingAvatar,
    header: account.header || account.header_static || missingHeader,
    header_static: account.header_static || account.header || missingHeader,
  };
};

type Account = ReturnType<typeof normalizeAccount>;

export { normalizeAccount, type Account };
