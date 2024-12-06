/**
 * @category Request params
 */
interface UploadMediaParams {
  /** Object. The file to be attached, encoded using multipart form data. The file must have a MIME type. */
  file: File;
  /** Object. The custom thumbnail of the media to be attached, encoded using multipart form data. */
  thumbnail?: File;
  /** String. A plain-text description of the media, for accessibility purposes. */
  description?: string;
  /**
   * String. Two floating points (x,y), comma-delimited, ranging from -1.0 to 1.0. See Focal points for cropping media thumbnails for more information.
   * @see {@link https://docs.joinmastodon.org/api/guidelines/#focal-points}
   */
  focus?: string;
}

/**
 * @category Request params
 */
interface UpdateMediaParams {
  /** Object. The custom thumbnail of the media to be attached, encoded using multipart form data. */
  thumbnail?: File;
  /** String. A plain-text description of the media, for accessibility purposes. */
  description?: string;
  /**
   * String. Two floating points (x,y), comma-delimited, ranging from -1.0 to 1.0. See Focal points for cropping media thumbnails for more information.
   * @see {@link https://docs.joinmastodon.org/api/guidelines/#focal-points}
   */
  focus?: string;
}

export type {
  UploadMediaParams,
  UpdateMediaParams,
};
