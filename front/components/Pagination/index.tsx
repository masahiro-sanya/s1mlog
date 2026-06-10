import Link from 'next/link';
import styles from './index.module.css';
import { getTotalPages } from '@/libs/pagination';

type Props = {
  totalCount: number;
  current?: number;
  basePath?: string;
  q?: string;
};

export default function Pagination({ totalCount, current = 1, basePath = '', q }: Props) {
  const pages = Array.from({ length: getTotalPages(totalCount) }).map((_, i) => i + 1);
  const query = q ? `?q=${encodeURIComponent(q)}` : '';

  // 1 ページ目は /p/1 という重複 URL を作らず basePath 直下へ戻す
  const hrefFor = (p: number) =>
    p === 1 ? `${basePath || '/'}${query}` : `${basePath}/p/${p}${query}`;

  return (
    <ul className={styles.container}>
      {pages.map((p) => (
        <li className={styles.list} key={p}>
          {current !== p ? (
            <Link href={hrefFor(p)} className={styles.item}>
              {p}
            </Link>
          ) : (
            <span className={`${styles.item} ${styles.current}`}>{p}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
