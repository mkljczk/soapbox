import React, { useCallback } from 'react';

import { undoUploadCompose, changeUploadCompose } from 'pl-fe/actions/compose';
import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';
import Upload from 'pl-fe/components/upload';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';

interface IUploadCompose {
  id: string;
  composeId: string;
  onSubmit?(): void;
  onDragStart: (id: string) => void;
  onDragEnter: (id: string) => void;
  onDragEnd: () => void;
}

const UploadCompose: React.FC<IUploadCompose> = ({ composeId, id, onSubmit, onDragStart, onDragEnter, onDragEnd }) => {
  const dispatch = useAppDispatch();
  const { pleroma: { metadata: { description_limit: descriptionLimit } } } = useInstance().data;

  const media = useCompose(composeId).media_attachments.find(item => item.id === id)!;

  const handleDescriptionChange = (description: string) => {
    dispatch(changeUploadCompose(composeId, media.id, { description }));
  };

  const handleDelete = () => {
    dispatch(undoUploadCompose(composeId, media.id));
  };

  const handleDragStart = useCallback(() => {
    onDragStart(id);
  }, [onDragStart, id]);

  const handleDragEnter = useCallback(() => {
    onDragEnter(id);
  }, [onDragEnter, id]);

  return (
    <Upload
      media={media}
      onDelete={handleDelete}
      onDescriptionChange={handleDescriptionChange}
      onSubmit={onSubmit}
      onDragStart={handleDragStart}
      onDragEnter={handleDragEnter}
      onDragEnd={onDragEnd}
      descriptionLimit={descriptionLimit}
      withPreview
    />
  );
};

export { UploadCompose as default };
