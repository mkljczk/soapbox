import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchHashtag, followHashtag, unfollowHashtag } from 'pl-fe/actions/tags';
import { fetchHashtagTimeline, clearTimeline } from 'pl-fe/actions/timelines';
import { useHashtagStream } from 'pl-fe/api/hooks/streaming/use-hashtag-stream';
import List, { ListItem } from 'pl-fe/components/list';
import Column from 'pl-fe/components/ui/column';
import Toggle from 'pl-fe/components/ui/toggle';
import Timeline from 'pl-fe/features/ui/components/timeline';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useIsMobile } from 'pl-fe/hooks/use-is-mobile';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';
import { useTheme } from 'pl-fe/hooks/use-theme';

interface IHashtagTimeline {
  params?: {
    id?: string;
  };
}

const HashtagTimeline: React.FC<IHashtagTimeline> = ({ params }) => {
  const tagId = params?.id || '';

  const features = useFeatures();
  const dispatch = useAppDispatch();
  const tag = useAppSelector((state) => state.tags.get(tagId));
  const { isLoggedIn } = useLoggedIn();
  const theme = useTheme();
  const isMobile = useIsMobile();

  const handleLoadMore = () => {
    dispatch(fetchHashtagTimeline(tagId, { }, true));
  };

  const handleFollow = () => {
    if (tag?.following) {
      dispatch(unfollowHashtag(tagId));
    } else {
      dispatch(followHashtag(tagId));
    }
  };

  useHashtagStream(tagId);

  useEffect(() => {
    dispatch(clearTimeline(`hashtag:${tagId}`));
    dispatch(fetchHashtag(tagId));
    dispatch(fetchHashtagTimeline(tagId));
  }, [tagId]);

  return (
    <Column label={`#${tagId}`} transparent={!isMobile}>
      {features.followHashtags && isLoggedIn && (
        <List>
          <ListItem
            className='mb-3 black:mx-4 black:mb-0'
            label={<FormattedMessage id='hashtag.follow' defaultMessage='Follow hashtag' />}
          >
            <Toggle
              checked={tag?.following}
              onChange={handleFollow}
            />
          </ListItem>
        </List>
      )}
      <Timeline
        className='black:p-0 black:sm:p-4 black:sm:pt-0'
        loadMoreClassName='black:sm:mx-4'
        scrollKey='hashtag_timeline'
        timelineId={`hashtag:${tagId}`}
        onLoadMore={handleLoadMore}
        emptyMessage={<FormattedMessage id='empty_column.hashtag' defaultMessage='There is nothing in this hashtag yet.' />}
        divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
      />
    </Column>
  );
};

export { HashtagTimeline as default };
