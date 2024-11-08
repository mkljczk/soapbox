import type { Tag } from 'pl-api';

const TRENDS_FETCH_SUCCESS = 'TRENDS_FETCH_SUCCESS';

const fetchTrendsSuccess = (tags: Array<Tag>) => ({
  type: TRENDS_FETCH_SUCCESS,
  tags,
});

type TrendsAction = ReturnType<typeof fetchTrendsSuccess>;

export {
  TRENDS_FETCH_SUCCESS,
  fetchTrendsSuccess,
  type TrendsAction,
};
