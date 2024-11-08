import { Settings } from 'pl-fe/schemas/pl-fe/settings';

import type { Status } from 'pl-fe/normalizers/status';

const shouldFilter = (
  status: Pick<Status, 'in_reply_to_id' | 'visibility' | 'reblog_id'>,
  columnSettings: Settings['timelines'][''],
) => {
  const fallback = {
    reblog: true,
    reply: true,
    direct: false,
  };

  const shows = {
    reblog: status.reblog_id !== null,
    reply: status.in_reply_to_id !== null,
    direct: status.visibility === 'direct',
  };

  return Object.entries(shows).some(([key, value]) => (columnSettings?.shows || fallback)[key as 'reblog' | 'reply' | 'direct'] === false && value);
};

export { shouldFilter };
