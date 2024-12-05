import React from 'react';

import Stack from 'pl-fe/components/ui/stack';

import { randomIntFromInterval, generateText } from '../utils';

const PlaceholderSidebarTrends = ({ limit }: { limit: number }) => {
  const trend = randomIntFromInterval(6, 3);
  const stat = randomIntFromInterval(10, 3);

  return (
    <>
      {new Array(limit).fill(undefined).map((_, idx) => (
        <Stack key={idx} className='text-primary-200 dark:text-primary-700 animate-pulse'>
          <p>{generateText(trend)}</p>
          <p>{generateText(stat)}</p>
        </Stack>
      ))}
    </>
  );
};

export { PlaceholderSidebarTrends as default };
