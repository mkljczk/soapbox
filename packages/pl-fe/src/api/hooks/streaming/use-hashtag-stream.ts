import { useTimelineStream } from './use-timeline-stream';

const useHashtagStream = (tag: string) => useTimelineStream('hashtag', { tag });

export { useHashtagStream };
