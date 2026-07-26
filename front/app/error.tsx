'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './error.module.css';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

// App Router のエラー境界。microCMS 取得失敗など、レンダリング中に投げられた例外を
// この画面で受け止める（Next.js のデフォルト画面に落とさない）。
export default function ErrorBoundary({ error, reset }: Props) {
  useEffect(() => {
    // 本番では error.message が伏せられ digest だけが渡るため、突き合わせ用に一緒に出す
    console.error('Unhandled error:', error.digest ?? '(no digest)', error);
  }, [error]);

  return (
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
        <Link href="/" className={styles.link}>
          トップへ戻る
        </Link>
      </div>
      {error.digest && <p className={styles.digest}>エラーID: {error.digest}</p>}
    </div>
  );
}
