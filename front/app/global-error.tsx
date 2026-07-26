'use client';

import { useEffect } from 'react';
import './globals.css';
import styles from './error.module.css';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

// ルートレイアウト自体が落ちたときの最終防衛線。error.tsx と違いレイアウトごと差し替わるため、
// html / body を自前で描画する必要がある。
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error('Unhandled root error:', error.digest ?? '(no digest)', error);
  }, [error]);

  return (
    <html lang="ja">
      <body>
        <div className={styles.container}>
          <dl>
            <dt className={styles.title}>エラーが発生しました</dt>
            <dd className={styles.text}>
              ページを表示できませんでした。時間をおいて再度お試しください。
            </dd>
          </dl>
          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={reset}>
              再読み込み
            </button>
            {/* ルートレイアウトが壊れている状態なので、クライアント遷移（next/link）ではなく
                ドキュメント全体を読み込み直す素の <a> を使う */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className={styles.link}>
              トップへ戻る
            </a>
          </div>
          {error.digest && <p className={styles.digest}>エラーID: {error.digest}</p>}
        </div>
      </body>
    </html>
  );
}
