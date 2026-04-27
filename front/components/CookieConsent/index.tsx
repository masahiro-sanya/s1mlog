'use client';

import { useEffect, useState } from 'react';
import styles from './index.module.css';

const STORAGE_KEY = 's1mlog_consent_v1';

type ConsentValue = 'granted' | 'denied';
type Visibility = 'pending' | 'visible' | 'hidden';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function applyConsent(value: ConsentValue) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  const gtag: (...args: unknown[]) => void =
    window.gtag ||
    function (...args: unknown[]) {
      (window.dataLayer as unknown[]).push(args);
    };
  gtag('consent', 'update', {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });
}

function readInitialState(): Visibility {
  if (typeof window === 'undefined') return 'pending';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ConsentValue | null;
    if (saved === 'granted' || saved === 'denied') {
      applyConsent(saved);
      return 'hidden';
    }
  } catch {
    /* ignore */
  }
  return 'visible';
}

export default function CookieConsent() {
  const [state, setState] = useState<Visibility>('pending');

  useEffect(() => {
    // クライアント初回マウント時のみ localStorage を読み、表示可否を確定する。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(readInitialState());
  }, []);

  const onChoose = (value: ConsentValue) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    applyConsent(value);
    setState('hidden');
  };

  if (state !== 'visible') return null;

  return (
    <div className={styles.banner} role="dialog" aria-live="polite" aria-label="Cookie同意">
      <p className={styles.text}>
        当サイトはアクセス解析・広告配信のために Cookie を使用します。詳細は
        <a className={styles.link} href="/privacy-policy">
          プライバシーポリシー
        </a>
        をご覧ください。
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.deny} onClick={() => onChoose('denied')}>
          拒否
        </button>
        <button type="button" className={styles.accept} onClick={() => onChoose('granted')}>
          同意する
        </button>
      </div>
    </div>
  );
}
