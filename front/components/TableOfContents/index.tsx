import * as cheerio from 'cheerio';
import styles from './index.module.css';

type Heading = {
  id: string;
  text: string;
  level: number;
};

const slugify = (raw: string, fallbackIndex: number): string => {
  const base = raw
    .normalize('NFKD')
    .replace(/[　\s]+/g, '-')
    .replace(/[^\w぀-ヿ一-龯ー一-龠ぁ-んァ-ンa-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return base || `heading-${fallbackIndex}`;
};

export const buildTocHtml = (html: string): { html: string; headings: Heading[] } => {
  if (!html) return { html: '', headings: [] };
  const $ = cheerio.load(html);
  const headings: Heading[] = [];
  const usedIds = new Set<string>();

  $('h2, h3').each((index, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    if (!text) return;
    const tagName = el.tagName?.toLowerCase?.() || $el.prop('tagName')?.toLowerCase() || 'h2';
    const level = tagName === 'h3' ? 3 : 2;
    let id = $el.attr('id') || slugify(text, index);
    let suffix = 1;
    while (usedIds.has(id)) {
      id = `${id}-${suffix++}`;
    }
    usedIds.add(id);
    $el.attr('id', id);
    headings.push({ id, text, level });
  });

  return { html: $.html(), headings };
};

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
