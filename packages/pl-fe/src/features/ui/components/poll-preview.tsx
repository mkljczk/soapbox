import noop from 'lodash/noop';
import React from 'react';

import PollOption from 'pl-fe/components/polls/poll-option';
import Stack from 'pl-fe/components/ui/stack';

import type { Poll } from 'pl-api';

interface IPollPreview {
  poll: Poll;
}

const PollPreview: React.FC<IPollPreview> = ({ poll }) => {
  if (typeof poll !== 'object') {
    return null;
  }

  return (
    <Stack space={2}>
      {poll.options.map((option, i) => (
        <PollOption
          key={i}
          poll={poll}
          option={option}
          index={i}
          showResults={false}
          active={false}
          onToggle={noop}
        />
      ))}
    </Stack>
  );
};

export { PollPreview as default };
