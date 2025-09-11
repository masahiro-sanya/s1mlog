import { formatRichText } from '@/libs/utils';
import { type Article } from '@/libs/microcms';
import PublishedDate from '../Date';
import styles from './index.module.css';
import TagList from '../TagList';
import Profile from '../Profile';

type Props = {
  data: Article;
};

export default function Article({ data }: Props) {
  // data.contentの確認
  const formattedContent = data.content ? formatRichText(data.content) : '';

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>{data.title || 'Untitled'}</h1>{' '}
        {/* タイトルが存在しない場合のデフォルト値 */}
        <TagList tags={data.tags || []} /> {/* タグが存在しない場合、空の配列を渡す */}
        <p className={styles.description}>{data.description || 'No description available.'}</p>
        <div className={styles.meta}>
          {data.writer && data.writer.image && (
            <div className={styles.writer}>
              <picture>
                <source
                  type="image/webp"
                  srcSet={`${data.writer.image.url}?fm=webp&fit=crop&w=48&h=48 1x, ${data.writer.image.url}?fm=webp&fit=crop&w=48&h=48&dpr=2 2x`}
                />
                <img
                  src={data.writer.image.url}
                  alt={data.writer.name || 'Writer'}
                  className={styles.writerIcon}
                  width={data.writer.image.width || 48}
                  height={data.writer.image.height || 48}
                />
              </picture>
              <span className={styles.writerName}>{data.writer.name || 'Anonymous'}</span>
            </div>
          )}
          <PublishedDate date={data.publishedAt || data.createdAt || new Date().toISOString()} />
        </div>
      </div>
      {data.thumbnail?.url && ( // サムネイルが存在する場合のみ表示
        <picture>
          <source
            type="image/webp"
            media="(max-width: 640px)"
            srcSet={`${data.thumbnail.url}?fm=webp&w=414 1x, ${data.thumbnail.url}?fm=webp&w=414&dpr=2 2x`}
          />
          <source
            type="image/webp"
            srcSet={`${data.thumbnail.url}?fm=webp&fit=crop&w=960&h=504 1x, ${data.thumbnail.url}?fm=webp&fit=crop&w=960&h=504&dpr=2 2x`}
          />
          <img
            src={data.thumbnail.url}
            alt=""
            className={styles.thumbnail}
            width={data.thumbnail.width || 960}
            height={data.thumbnail.height || 504}
          />
        </picture>
      )}
      <div className={styles.content} dangerouslySetInnerHTML={{ __html: formattedContent }} />
      {data.writer && <Profile writer={data.writer} />}
    </main>
  );
}
