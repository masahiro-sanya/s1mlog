import type { Heading } from '@/libs/toc';
import styles from './index.module.css';

type Props = {
  headings: Heading[];
};

export default function TableOfContents({ headings }: Props) {
  if (headings.length < 2) return null;

  return (
    <nav className={styles.toc} aria-label="目次">
      <p className={styles.title}>目次</p>
      <ol className={styles.list}>
        {headings.map((h) => (
          <li
            key={h.id}
            className={`${styles.item} ${h.level === 3 ? styles.level3 : styles.level2}`}
          >
            <a href={`#${h.id}`} className={styles.link}>
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
