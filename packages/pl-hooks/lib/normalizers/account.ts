import type { Account as BaseAccount } from 'pl-api';

const normalizeAccount = ({ moved, relationship, ...account }: BaseAccount) => ({
  ...account,
  moved_id: moved?.id || null,
});

type Account = ReturnType<typeof normalizeAccount>;

export { normalizeAccount, type Account as NormalizedAccount };
