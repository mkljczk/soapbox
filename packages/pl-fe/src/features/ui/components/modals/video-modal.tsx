import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from '@tanstack/react-router';

import Video from 'pl-fe/features/video';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { makeGetStatus } from 'pl-fe/selectors';

import type { BaseModalProps } from '../modal-root';
import type { MediaAttachment } from 'pl-api';

type VideoModalProps = {
  media: MediaAttachment;
  statusId: string;
  time?: number;
};

const VideoModal: React.FC<VideoModalProps & BaseModalProps> = ({ statusId, media, time }) => {
  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector(state => getStatus(state, { id: statusId }))!;

  const link = status && (
    <Link to={`/@${status.account.acct}/posts/${status.id}`}>
      <FormattedMessage id='lightbox.view_context' defaultMessage='View context' />
    </Link>
  );

  return (
    <div className='pointer-events-auto mx-auto block w-full max-w-xl overflow-hidden rounded-2xl text-left align-middle shadow-xl transition-all'>
      <Video
        preview={media.preview_url}
        blurhash={media.blurhash}
        src={media.url}
        startTime={time}
        link={link}
        detailed
        autoFocus
        alt={media.description}
        visible
      />
    </div>
  );
};

export { type VideoModalProps, VideoModal as default };
