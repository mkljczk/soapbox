import { useTimelineStream } from './use-timeline-stream';

interface UseCommunityStreamOpts {
  onlyMedia?: boolean;
  enabled?: boolean;
}

const useCommunityStream = ({ onlyMedia, enabled }: UseCommunityStreamOpts = {}) =>
  useTimelineStream(`public:local${onlyMedia ? ':media' : ''}`, {}, enabled);

export { useCommunityStream };
