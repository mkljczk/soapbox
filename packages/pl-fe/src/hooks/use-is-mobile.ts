import { useScreenWidth } from './use-screen-width';

export function useIsMobile() {
  const screenWidth = useScreenWidth();
  return screenWidth <= 581;
}
