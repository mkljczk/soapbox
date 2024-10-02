import { useStatus } from 'pl-fe/pl-hooks/hooks/statuses/useStatus';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import Link from 'pl-fe/components/link';
import { Text } from 'pl-fe/components/ui';
import { useCompose } from 'pl-fe/hooks';

interface IReplyGroupIndicator {
  composeId: string;
}

const ReplyGroupIndicator = (props: IReplyGroupIndicator) => {
  const { composeId } = props;

  const inReplyTo = useCompose(composeId).in_reply_to!;

  const { data: status } = useStatus(inReplyTo);
  const group = status?.group;

  if (!group) {
    return null;
  }

  return (
    <Text theme='muted' size='sm'>
      <FormattedMessage
        id='compose.reply_group_indicator.message'
        defaultMessage='Posting to {groupLink}'
        values={{
          groupLink: <Link
            to={`/groups/${group.id}`}
            dangerouslySetInnerHTML={{ __html: group.display_name_html }}
          />,
        }}
      />
    </Text>
  );
};

export { ReplyGroupIndicator as default };
