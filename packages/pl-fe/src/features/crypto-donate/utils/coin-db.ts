import coinDB from './manifest-map';

/** Get title from CoinDB based on ticker symbol */
const getTitle = (ticker: string): string => {
  const title = coinDB[ticker]?.name;
  return typeof title === 'string' ? title : '';
};

export { getTitle };
