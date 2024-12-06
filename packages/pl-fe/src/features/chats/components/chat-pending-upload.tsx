import React from 'react';

import ProgressBar from 'pl-fe/components/ui/progress-bar';

interface IChatPendingUpload {
  progress: number;
}

/** Displays a loading thumbnail for an upload in the chat composer. */
const ChatPendingUpload: React.FC<IChatPendingUpload> = ({ progress }) => (
  <div className='relative isolate inline-flex size-24 items-center justify-center overflow-hidden rounded-lg bg-gray-200 p-4 dark:bg-primary-900'>
    <ProgressBar progress={progress} size='sm' />
  </div>
);

export { ChatPendingUpload as default };
