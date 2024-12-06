import { PaginationParams } from './common';

/**
 * @category Request params
 */
interface CreateEventParams {
  /** name of the event */
  name: string;
  /** optional, description of the event */
  status?: string;
  /** optional, event banner attachment ID */
  banner_id?: string;
  /** start time of the event */
  start_time?: string;
  /** optional, end time of the event */
  end_time?: string;
  /** optional, event join mode, either free or restricted, defaults to free */
  join_mode?: 'free' | 'restricted';
  /** optional, location ID from the location provider used by server */
  location_id?: string;
  /** string, contain the MIME type of the status. */
  content_type?: string;
}

/**
 * @category Request params
 */
type EditEventParams = Partial<Omit<CreateEventParams, 'join_mode'>>;

/**
 * @category Request params
 */
type GetJoinedEventsParams = PaginationParams;

/**
 * @category Request params
 */
type GetEventParticipationsParams = PaginationParams;

/**
 * @category Request params
 */
type GetEventParticipationRequestsParams = PaginationParams;

export type {
  CreateEventParams,
  EditEventParams,
  GetJoinedEventsParams,
  GetEventParticipationsParams,
  GetEventParticipationRequestsParams,
};
