import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/libs/microcms';
import styles from './index.module.css';
import TagList from '../TagList';
import PublishedDate from '../Date';

type Props = {
  article: Article;
};

export default function ArticleListItem({ article }: Props) {
  return (
    <li className={styles.list}>
      <Link href={`/articles/${article.id}`} className={styles.link}>
        <div className={styles.imageWrap}>
          {article.thumbnail ? (
            <picture>
              <source
                type="image/webp"
                media="(max-width: 640px)"
                srcSet={`${article.thumbnail?.url}?fm=webp&fit=crop&w=720&h=405 1x, ${article.thumbnail?.url}?fm=webp&fit=crop&w=720&h=405&dpr=2 2x`}
              />
              <source
                type="image/webp"
                srcSet={`${article.thumbnail?.url}?fm=webp&fit=crop&w=440&h=248 1x, ${article.thumbnail?.url}?fm=webp&fit=crop&w=440&h=248&dpr=2 2x`}
              />
              <img
                src={article.thumbnail?.url || `/noimage.png`}
                alt=""
                className={styles.image}
                loading="lazy"
                width={article.thumbnail?.width}
                height={article.thumbnail?.height}
              />
            </picture>
          ) : (
            <Image
              className={styles.image}
              src="/no-image.png"
              alt="No Image"
              width={1200}
              height={630}
            />
          )}
        </div>
        <dl className={styles.content}>
          <dt className={styles.title}>{article.title}</dt>
          <dd className={styles.tagRow}>
            <TagList tags={article.tags} hasLink={false} />
          </dd>
          <dd className={styles.date}>
            <PublishedDate date={article.publishedAt || article.createdAt} />
          </dd>
        </dl>
      </Link>
    </li>
  );
}
