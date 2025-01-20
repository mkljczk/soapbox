import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Sparklines, SparklinesCurve } from 'react-sparklines';

import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';

import { shortNumberFormat } from '../utils/numbers';

import type { Tag } from 'pl-api';

const accountsCountRenderer = (count: number) => !!count && (
  <Text theme='muted' size='sm'>
    <FormattedMessage
      id='trends.count_by_accounts'
      defaultMessage='{count} {rawCount, plural, one {person} other {people}} talking'
      values={{
        rawCount: count,
        count: <strong>{shortNumberFormat(count)}</strong>,
      }}
    />
  </Text>
);

interface IHashtag {
  hashtag: Tag;
}

const Hashtag: React.FC<IHashtag> = ({ hashtag }) => {
  const count = Number(hashtag.history?.[0]?.accounts);

  return (
    <HStack alignItems='center' justifyContent='between' data-testid='hashtag'>
      <Stack>
        <Link to={`/tags/${hashtag.name}`} className='hover:underline'>
          <Text tag='span' size='sm' weight='semibold'>#{hashtag.name}</Text>
        </Link>

        {accountsCountRenderer(count)}
      </Stack>

      {hashtag.history && (
        <div className='w-[40px]' data-testid='sparklines'>
          <Sparklines
            width={40}
            height={28}
            data={hashtag.history.toReversed().map((day) => +day.uses)}
          >
            <SparklinesCurve style={{ fill: 'none' }} color='#818cf8' />
          </Sparklines>
        </div>
      )}
    </HStack>
  );
};

export { Hashtag as default, accountsCountRenderer };
