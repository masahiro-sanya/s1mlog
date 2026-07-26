import styles from './loading.module.css';

// 記事詳細のつなぎ表示。一覧用スケルトン（app/loading.tsx）だと形が合わないため個別に持つ。
const BODY_LINE_COUNT = 8;

export default function Loading() {
  return (
    <div className={styles.container} role="status" aria-busy="true" aria-label="読み込み中">
      <div className={`${styles.title} ${styles.shimmer}`} />
      <div className={`${styles.meta} ${styles.shimmer}`} />
      <div className={`${styles.thumbnail} ${styles.shimmer}`} />
      {Array.from({ length: BODY_LINE_COUNT }, (_, i) => (
        <div
          key={i}
          // 段落の切れ目に見えるよう、数行ごとに短い行を混ぜる
          className={`${styles.line} ${(i + 1) % 4 === 0 ? styles.lineShort : ''} ${styles.shimmer}`}
        />
      ))}
    </div>
  );
}
