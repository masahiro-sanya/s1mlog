'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const SCROLL_THRESHOLDS = [25, 50, 75, 90];

export default function AnalyticsListeners() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fired = new Set<number>();

    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const percent = Math.round((scrollTop / docHeight) * 100);
      for (const t of SCROLL_THRESHOLDS) {
        if (percent >= t && !fired.has(t)) {
          fired.add(t);
          window.gtag?.('event', 'scroll', {
            percent_scrolled: t,
            page_path: window.location.pathname,
          });
        }
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href) return;
      const isExternal = /^https?:\/\//.test(href) && !href.includes(window.location.host);
      if (!isExternal) return;
      window.gtag?.('event', 'click_outbound', {
        link_url: href,
        link_text: target.textContent?.slice(0, 80) || '',
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return null;
}
