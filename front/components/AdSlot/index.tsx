'use client';

import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT } from '@/constants';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  slot: string;
  format?: 'auto' | 'fluid';
  layout?: string;
  responsive?: boolean;
  className?: string;
};

export default function AdSlot({
  slot,
  format = 'auto',
  layout,
  responsive = true,
  className,
}: Props) {
  const ref = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !ref.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ignore */
    }
  }, []);

  if (!ADSENSE_CLIENT) return null;

  return (
    <ins
      ref={ref}
      className={`adsbygoogle ${className || ''}`}
      style={{ display: 'block' }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      {...(layout ? { 'data-ad-layout': layout } : {})}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
}
