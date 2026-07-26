import styles from './loading.module.css';

// 記事一覧のレイアウトに合わせたスケルトン。件数は見た目のつなぎなので固定値でよい。
const SKELETON_COUNT = 5;

export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="読み込み中">
      <ul className={styles.list}>
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <li key={i} className={styles.item}>
            <div className={`${styles.thumbnail} ${styles.shimmer}`} />
            <div className={styles.content}>
              <div className={`${styles.line} ${styles.shimmer}`} />
              <div className={`${styles.line} ${styles.lineMedium} ${styles.shimmer}`} />
              <div className={`${styles.line} ${styles.lineShort} ${styles.shimmer}`} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
