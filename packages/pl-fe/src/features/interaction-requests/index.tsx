import React from 'react';

import { useInteractionRequests } from 'pl-fe/api/hooks/statuses/use-interaction-requests';

const InteractionRequests = () => {
  const interactionRequestsQuery = useInteractionRequests();

  return <>{JSON.stringify(interactionRequestsQuery.data)}</>;
};

export { InteractionRequests as default };
