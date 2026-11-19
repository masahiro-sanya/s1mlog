import Link from 'next/link';
import { SITE_URL } from '@/constants';
import JsonLd from '../JsonLd';
import styles from './index.module.css';

export type Crumb = {
  name: string;
  href?: string;
};

type Props = {
  items: Crumb[];
};

// 構造化データの URL は trailingSlash: true に合わせて末尾 / を付ける（クエリ・ハッシュ付きは触らない）
const toSchemaUrl = (href: string): string =>
  /[?#]/.test(href) || href.endsWith('/') ? `${SITE_URL}${href}` : `${SITE_URL}${href}/`;

export default function Breadcrumb({ items }: Props) {
  if (items.length === 0) return null;

  const itemListElement = items.map((c, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: c.name,
    ...(c.href ? { item: toSchemaUrl(c.href) } : {}),
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };

  return (
    <>
      <nav aria-label="パンくず" className={styles.nav}>
        <ol className={styles.list}>
          {items.map((c, index) => (
            <li key={`${c.name}-${index}`} className={styles.item}>
              {c.href && index < items.length - 1 ? (
                <Link href={c.href} className={styles.link}>
                  {c.name}
                </Link>
              ) : (
                <span aria-current="page">{c.name}</span>
              )}
              {index < items.length - 1 && <span className={styles.sep}> / </span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={schema} />
    </>
  );
}
