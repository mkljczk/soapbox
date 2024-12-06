import type { AdminReport as BaseAdminReport } from 'pl-api';

const normalizeAdminReport = ({
  account, target_account, action_taken_by_account, assigned_account, statuses, ...report
}: BaseAdminReport) => ({
  ...report,
  account_id: account?.id || null,
  target_account_id: target_account?.id || null,
  action_taken_by_account_id: action_taken_by_account?.id || null,
  assigned_account_id: assigned_account?.id || null,
  status_ids: statuses.map(status => status.id),
});

type AdminReport = ReturnType<typeof normalizeAdminReport>;

export { normalizeAdminReport, type AdminReport };
