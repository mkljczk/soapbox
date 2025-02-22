import React from 'react';

import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';

import { generateText, randomIntFromInterval } from '../utils';

const PlaceholderGroupCard = () => {
  const groupNameLength = randomIntFromInterval(12, 20);

  return (
    <div className='animate-pulse'>
      <Stack className='relative h-[240px] rounded-lg border border-solid border-gray-300 bg-white black:bg-black dark:border-primary-800 dark:bg-primary-900'>
        {/* Group Cover Image */}
        <div className='relative grow basis-1/2 rounded-t-lg bg-gray-300 dark:bg-gray-800' />

        {/* Group Avatar */}
        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
          <div className='size-16 rounded-lg bg-gray-500 ring-2 ring-white dark:bg-primary-800 dark:ring-primary-900' />
        </div>

        {/* Group Info */}
        <Stack alignItems='center' justifyContent='end' grow className='basis-1/2 py-4' space={0.5}>
          <Text size='lg' theme='subtle' weight='bold'>{generateText(groupNameLength)}</Text>

          <HStack className='text-gray-400 dark:text-gray-600' space={3} wrap>
            <span>{generateText(6)}</span>
            <span>{generateText(6)}</span>
          </HStack>
        </Stack>
      </Stack>
    </div>
  );
};

export { PlaceholderGroupCard as default };
