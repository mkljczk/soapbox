import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';

import { useTimelineStream } from './use-timeline-stream';

const useListStream = (listId: string) => {
  const { isLoggedIn } = useLoggedIn();

  return useTimelineStream('list', { list: listId }, isLoggedIn);
};

export { useListStream };
