import { create } from 'mutative';
import { statusSchema } from 'pl-api';
import * as v from 'valibot';

import { normalizeStatus } from 'pl-fe/normalizers/status';
import { makeGetAccount } from 'pl-fe/selectors';

import type { PendingStatus } from 'pl-fe/reducers/pending-statuses';
import type { RootState } from 'pl-fe/store';

const getAccount = makeGetAccount();

const buildMentions = (pendingStatus: PendingStatus) => {
  if (pendingStatus.in_reply_to_id) {
    return (pendingStatus.to || []).map(acct => ({ acct }));
  } else {
    return [];
  }
};

const buildPoll = (pendingStatus: PendingStatus) => {
  if (pendingStatus.poll?.options) {
    return create(pendingStatus.poll, (draft) => {
      // @ts-ignore
      draft.options = draft.options.map((title) => ({ title }));
    });
  } else {
    return null;
  }
};

const buildStatus = (state: RootState, pendingStatus: PendingStatus, idempotencyKey: string) => {
  const me = state.me as string;
  const account = getAccount(state, me);
  const inReplyToId = pendingStatus.in_reply_to_id;

  const status = {
    account,
    content: pendingStatus.status.replace(new RegExp('\n', 'g'), '<br>'), /* eslint-disable-line no-control-regex */
    id: `末pending-${idempotencyKey}`,
    in_reply_to_account_id: state.statuses[inReplyToId || '']?.account_id || null,
    in_reply_to_id: inReplyToId,
    media_attachments: (pendingStatus.media_ids || []).map((id: string) => ({ id })),
    mentions: buildMentions(pendingStatus),
    poll: buildPoll(pendingStatus),
    quote: pendingStatus.quote_id ? state.statuses[pendingStatus.quote_id] : null,
    sensitive: pendingStatus.sensitive,
    visibility: pendingStatus.visibility,
  };

  return normalizeStatus(v.parse(statusSchema, status));
};

export { buildStatus };
