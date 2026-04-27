'use client';

import { useState } from 'react';
import { SITE_URL } from '@/constants';
import styles from './index.module.css';

type Props = {
  url: string; // パス。先頭スラッシュ。例: /articles/abc
  title: string;
};

export default function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);
  const fullUrl = `${SITE_URL}${url}`;

  const xUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`;
  const hatenaUrl = `https://b.hatena.ne.jp/entry/${fullUrl.replace(/^https?:\/\//, '')}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={styles.wrap} aria-label="この記事をシェア">
      <a
        className={`${styles.btn} ${styles.x}`}
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Xで共有
      </a>
      <a
        className={`${styles.btn} ${styles.hatena}`}
        href={hatenaUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        はてブ
      </a>
      <button type="button" className={`${styles.btn} ${styles.copy}`} onClick={onCopy}>
        {copied ? 'コピーしました' : 'URLコピー'}
      </button>
    </div>
  );
}
