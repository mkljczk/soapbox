import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { importFetchedStatuses } from 'pl-fe/actions/importer';
import { expandTimelineSuccess } from 'pl-fe/actions/timelines';
import Column from 'pl-fe/components/ui/column';
import Timeline from 'pl-fe/features/ui/components/timeline';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useIsMobile } from 'pl-fe/hooks/use-is-mobile';
import { useTheme } from 'pl-fe/hooks/use-theme';

const messages = defineMessages({
  title: { id: 'column.test', defaultMessage: 'Test timeline' },
});

/**
 * List of mock statuses to display in the timeline.
 * These get embedded into the build, but only in this chunk, so it's okay.
 */
const MOCK_STATUSES: any[] = [
  require('pl-fe/__fixtures__/pleroma-status.json'),
  require('pl-fe/__fixtures__/pleroma-status-with-poll.json'),
  require('pl-fe/__fixtures__/pleroma-status-vertical-video-without-metadata.json'),
  require('pl-fe/__fixtures__/pleroma-status-with-poll-with-emojis.json'),
  require('pl-fe/__fixtures__/pleroma-quote-of-quote-post.json'),
];

const timelineId = 'test';
const onlyMedia = false;

const TestTimeline: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    dispatch(importFetchedStatuses(MOCK_STATUSES));
    dispatch(expandTimelineSuccess(timelineId, MOCK_STATUSES, null, null, false, false));
  }, []);

  return (
    <Column label={intl.formatMessage(messages.title)} transparent={!isMobile}>
      <Timeline
        scrollKey={`${timelineId}_timeline`}
        timelineId={`${timelineId}${onlyMedia ? ':media' : ''}`}
        emptyMessage={<FormattedMessage id='empty_column.test' defaultMessage='The test timeline is empty.' />}
        divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
      />
    </Column>
  );
};

export { TestTimeline as default };
