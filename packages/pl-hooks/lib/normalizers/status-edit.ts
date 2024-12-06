import { StatusEdit } from 'pl-api';

const normalizeStatusEdit = ({ account, ...statusEdit }: StatusEdit) => ({
  account_id: account.id,
  ...statusEdit,
});

export { normalizeStatusEdit };
