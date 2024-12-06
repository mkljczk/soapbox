import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import Text from 'pl-fe/components/ui/text';
import { shortNumberFormat } from 'pl-fe/utils/numbers';

import type { Group } from 'pl-fe/normalizers/group';

interface IGroupMemberCount {
  group: Pick<Group, 'id' | 'members_count'>;
}

const GroupMemberCount = ({ group }: IGroupMemberCount) => (
  <Link to={`/groups/${group.id}/members`} className='hover:underline'>
    <Text theme='inherit' tag='span' size='sm' weight='medium' data-testid='group-member-count'>
      {shortNumberFormat(group.members_count)}
      {' '}
      <FormattedMessage
        id='groups.discover.search.results.member_count'
        defaultMessage='{members, plural, one {member} other {members}}'
        values={{
          members: group.members_count,
        }}
      />
    </Text>
  </Link>
);

export { GroupMemberCount as default };
