import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/** 进入新页面时滚到顶部；浏览器返回（POP）时不干预，便于回到列表原位置 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType === 'POP') return;

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, navigationType]);

  return null;
}
