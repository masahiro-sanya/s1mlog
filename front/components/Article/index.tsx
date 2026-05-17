import { formatRichText } from '@/libs/utils';
import { type Article } from '@/libs/microcms';
import PublishedDate from '../Date';
import TableOfContents, { buildTocHtml } from '../TableOfContents';
import AdSlot from '../AdSlot';
import PRDisclosure from '../PRDisclosure';
import styles from './index.module.css';
import TagList from '../TagList';

type Props = {
  data: Article;
};

const AD_SLOT_ARTICLE_TOP = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_TOP || '';
const AD_SLOT_ARTICLE_MID = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID || '';
const AD_SLOT_ARTICLE_BOTTOM = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_BOTTOM || '';

export default function Article({ data }: Props) {
  const formattedContent = data.content ? formatRichText(data.content) : '';
  const { headings, firstHalfHtml, secondHalfHtml } = buildTocHtml(formattedContent);
  const isSplit = Boolean(firstHalfHtml);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>{data.title || 'Untitled'}</h1>
        <TagList tags={data.tags || []} />
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
      {data.thumbnail?.url && (
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
            alt={data.title || ''}
            className={styles.thumbnail}
            width={data.thumbnail.width || 960}
            height={data.thumbnail.height || 504}
          />
        </picture>
      )}
      <PRDisclosure />
      <TableOfContents headings={headings} />
      {AD_SLOT_ARTICLE_TOP && (
        <div className={styles.adSlot}>
          <AdSlot slot={AD_SLOT_ARTICLE_TOP} format="auto" />
        </div>
      )}
      {isSplit ? (
        <>
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: firstHalfHtml }} />
          {AD_SLOT_ARTICLE_MID && (
            <div className={styles.adSlot}>
              <AdSlot slot={AD_SLOT_ARTICLE_MID} format="fluid" layout="in-article" />
            </div>
          )}
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: secondHalfHtml }} />
        </>
      ) : (
        <div className={styles.content} dangerouslySetInnerHTML={{ __html: secondHalfHtml }} />
      )}
      {AD_SLOT_ARTICLE_BOTTOM && (
        <div className={styles.adSlot}>
          <AdSlot slot={AD_SLOT_ARTICLE_BOTTOM} format="auto" />
        </div>
      )}
    </main>
  );
}
