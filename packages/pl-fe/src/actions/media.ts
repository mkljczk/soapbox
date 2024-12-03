import { defineMessages, type IntlShape } from 'react-intl';

import toast from 'pl-fe/toast';
import { isLoggedIn } from 'pl-fe/utils/auth';
import { formatBytes, getVideoDuration } from 'pl-fe/utils/media';
import resizeImage from 'pl-fe/utils/resize-image';

import { getClient } from '../api';

import type { MediaAttachment, UploadMediaParams } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const messages = defineMessages({
  exceededImageSizeLimit: { id: 'upload_error.image_size_limit', defaultMessage: 'Image exceeds the current file size limit ({limit})' },
  exceededVideoSizeLimit: { id: 'upload_error.video_size_limit', defaultMessage: 'Video exceeds the current file size limit ({limit})' },
  exceededVideoDurationLimit: { id: 'upload_error.video_duration_limit', defaultMessage: 'Video exceeds the current duration limit ({limit, plural, one {# second} other {# seconds}})' },
});

const noOp = () => {};

const updateMedia = (mediaId: string, params: Record<string, any>) =>
  (_dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState()).media.updateMedia(mediaId, params);

const uploadMedia = (body: UploadMediaParams, onUploadProgress: (e: ProgressEvent) => void = noOp) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState()).media.uploadMedia(body, { onUploadProgress });

const uploadFile = (
  file: File,
  intl: IntlShape,
  onSuccess: (data: MediaAttachment) => void = () => {},
  onFail: (error: unknown) => void = () => {},
  onProgress: (e: ProgressEvent) => void = () => {},
  changeTotal: (value: number) => void = () => {},
) => async (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;
  const maxImageSize = getState().instance.configuration.media_attachments.image_size_limit;
  const maxVideoSize = getState().instance.configuration.media_attachments.video_size_limit;
  const maxVideoDuration = getState().instance.configuration.media_attachments.video_duration_limit;

  const isImage = file.type.match(/image.*/);
  const isVideo = file.type.match(/video.*/);
  const videoDurationInSeconds = (isVideo && maxVideoDuration) ? await getVideoDuration(file) : 0;

  if (isImage && maxImageSize && (file.size > maxImageSize)) {
    const limit = formatBytes(maxImageSize);
    const message = intl.formatMessage(messages.exceededImageSizeLimit, { limit });
    toast.error(message);
    onFail(true);
    return;
  } else if (isVideo && maxVideoSize && (file.size > maxVideoSize)) {
    const limit = formatBytes(maxVideoSize);
    const message = intl.formatMessage(messages.exceededVideoSizeLimit, { limit });
    toast.error(message);
    onFail(true);
    return;
  } else if (isVideo && maxVideoDuration && (videoDurationInSeconds > maxVideoDuration)) {
    const message = intl.formatMessage(messages.exceededVideoDurationLimit, { limit: maxVideoDuration });
    toast.error(message);
    onFail(true);
    return;
  }

  // FIXME: Don't define const in loop
  resizeImage(file).then(resized => {
    const data = new FormData();
    data.append('file', resized);
    // Account for disparity in size of original image and resized data
    changeTotal(resized.size - file.size);

    return dispatch(uploadMedia({ file: resized }, onProgress))
      .then((data) => {
        // If server-side processing of the media attachment has not completed yet,
        // poll the server until it is, before showing the media attachment as uploaded
        if (data.url) {
          onSuccess(data);
        } else if (data.url === null) {
          const poll = () => {
            getClient(getState()).media.getMedia(data.id).then((data) => {
              if (data.url) {
                onSuccess(data);
              } else if (data.url === null) {
                setTimeout(() => poll(), 1000);
              }
            }).catch(error => onFail(error));
          };

          poll();
        }
      });
  }).catch(error => onFail(error));
};

export {
  updateMedia,
  uploadMedia,
  uploadFile,
};
