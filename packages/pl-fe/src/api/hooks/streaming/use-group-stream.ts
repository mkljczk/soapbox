import { useTimelineStream } from './use-timeline-stream';

const useGroupStream = (groupId: string) => useTimelineStream('group', { group: groupId } as any);

export { useGroupStream };
