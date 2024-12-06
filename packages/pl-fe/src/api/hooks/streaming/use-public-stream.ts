import { useTimelineStream } from './use-timeline-stream';

interface UsePublicStreamOpts {
  onlyMedia?: boolean;
}

const usePublicStream = ({ onlyMedia }: UsePublicStreamOpts = {}) =>
  useTimelineStream(`public${onlyMedia ? ':media' : ''}`);

export { usePublicStream };
