import clsx from 'clsx';
import React, { useCallback, useRef } from 'react';

import { changeMediaOrder } from 'pl-fe/actions/compose';
import HStack from 'pl-fe/components/ui/hstack';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';

import Upload from './upload';
import UploadProgress from './upload-progress';

interface IUploadForm {
  composeId: string;
  onSubmit(): void;
}

const UploadForm: React.FC<IUploadForm> = ({ composeId, onSubmit }) => {
  const dispatch = useAppDispatch();

  const { is_uploading: isUploading, media_attachments: mediaAttachments } = useCompose(composeId);

  const mediaIds = mediaAttachments.map((item) => item.id);

  const dragItem = useRef<string | null>();
  const dragOverItem = useRef<string | null>();

  const handleDragStart = useCallback((id: string) => {
    dragItem.current = id;
  }, [dragItem]);

  const handleDragEnter = useCallback((id: string) => {
    dragOverItem.current = id;
  }, [dragOverItem]);

  const handleDragEnd = useCallback(() => {
    dispatch(changeMediaOrder(composeId, dragItem.current!, dragOverItem.current!));
    dragItem.current = null;
    dragOverItem.current = null;
  }, [dragItem, dragOverItem]);

  if (!isUploading && !mediaIds.length) return null;

  return (
    <div className='overflow-hidden'>
      <UploadProgress composeId={composeId} />

      <HStack wrap className={clsx('overflow-hidden', mediaIds.length > 0 && 'm-[-5px]')}>
        {mediaIds.map((id: string) => (
          <Upload
            id={id}
            key={id}
            composeId={composeId}
            onSubmit={onSubmit}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
          />
        ))}
      </HStack>
    </div>
  );
};

export { UploadForm as default };
