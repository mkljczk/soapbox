import noop from 'lodash/noop';
import React, { Suspense } from 'react';

import StatusContent from 'pl-fe/components/status-content';
import Stack from 'pl-fe/components/ui/stack';
import Toggle from 'pl-fe/components/ui/toggle';
import { MediaGallery, Video, Audio } from 'pl-fe/features/ui/util/async-components';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';

interface IStatusCheckBox {
  id: string;
  disabled?: boolean;
  toggleStatusReport: (value: boolean) => void;
  checked: boolean;
}

const StatusCheckBox: React.FC<IStatusCheckBox> = ({ id, disabled, checked, toggleStatusReport }) => {
  const status = useAppSelector((state) => state.statuses[id]);

  const onToggle: React.ChangeEventHandler<HTMLInputElement> = (e) => toggleStatusReport(e.target.checked);

  if (!status || status.reblog_id) {
    return null;
  }

  let media;

  if (status.media_attachments.length > 0) {
    if (status.media_attachments.some(item => item.type === 'unknown')) {
      // Do nothing
    } else if (status.media_attachments[0]?.type === 'video') {
      const video = status.media_attachments[0];

      if (video) {
        media = (
          <Video
            preview={video.preview_url}
            blurhash={video.blurhash}
            src={video.url}
            alt={video.description}
            aspectRatio={video.meta.original?.aspect as number | undefined}
            width={239}
            height={110}
            inline
          />
        );
      }
    } else if (status.media_attachments[0]?.type === 'audio') {
      const audio = status.media_attachments[0];

      if (audio) {
        media = (
          <Audio
            src={audio.url}
            alt={audio.description}
          />
        );
      }
    } else {
      media = (
        <MediaGallery
          media={status.media_attachments}
          height={110}
          onOpenMedia={noop}
        />
      );
    }
  }

  return (
    <div className='flex items-center justify-between'>
      <Stack className='status-check-box__status py-2' space={1}>
        <StatusContent status={status} />
        <Suspense>{media}</Suspense>
      </Stack>

      <div className='flex items-center justify-center p-2.5'>
        <Toggle checked={checked} onChange={onToggle} disabled={disabled} />
      </div>
    </div>
  );
};

export { StatusCheckBox as default };
