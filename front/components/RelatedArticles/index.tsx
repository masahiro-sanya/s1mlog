import Link from 'next/link';
import { type Article, getList } from '@/libs/microcms';
import styles from './index.module.css';

type Props = {
  current: Article;
  limit?: number;
};

export default async function RelatedArticles({ current, limit = 3 }: Props) {
  const tagIds = (current.tags || []).map((t) => t.id);
  if (tagIds.length === 0) return null;

  const filters = tagIds.map((id) => `tags[contains]${id}`).join('[or]');
  const data = await getList({ limit: limit + 1, filters });
  const related = (data.contents || []).filter((a) => a.id !== current.id).slice(0, limit);

  if (related.length === 0) return null;

  return (
    <aside className={styles.wrap} aria-label="関連記事">
      <h2 className={styles.heading}>関連記事</h2>
      <ul className={styles.list}>
        {related.map((article) => (
          <li key={article.id} className={styles.item}>
            <Link href={`/articles/${article.id}`} className={styles.link}>
              {article.thumbnail?.url && (
                <picture>
                  <source
                    type="image/webp"
                    srcSet={`${article.thumbnail.url}?fm=webp&fit=crop&w=240&h=135 1x, ${article.thumbnail.url}?fm=webp&fit=crop&w=240&h=135&dpr=2 2x`}
                  />
                  <img
                    src={article.thumbnail.url}
                    alt=""
                    className={styles.thumb}
                    width={240}
                    height={135}
                    loading="lazy"
                  />
                </picture>
              )}
              <span className={styles.title}>{article.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
