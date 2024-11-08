import React from 'react';

import { useGroups } from 'pl-fe/api/hooks/groups/use-groups';
import Widget from 'pl-fe/components/ui/widget';
import GroupListItem from 'pl-fe/features/groups/components/discover/group-list-item';
import PlaceholderGroupSearch from 'pl-fe/features/placeholder/components/placeholder-group-search';

const MyGroupsPanel = () => {
  const { groups, isFetching, isFetched, isError } = useGroups();
  const isEmpty = (isFetched && groups.length === 0) || isError;

  if (isEmpty) {
    return null;
  }

  return (
    <Widget
      title='My Groups'
    >
      {isFetching ? (
        new Array(3).fill(0).map((_, idx) => (
          <PlaceholderGroupSearch key={idx} withJoinAction={false} />
        ))
      ) : (
        groups.slice(0, 3).map((group) => (
          <GroupListItem group={group} withJoinAction={false} key={group.id} />
        ))
      )}
    </Widget>
  );
};

export { MyGroupsPanel as default };
