import type { MetadataRoute } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { SITE_URL } from '@/constants';
import { getAllContentMeta, type ContentMeta } from '@/libs/microcms';

export const revalidate = 60;

const STATIC_PATHS = ['/', '/contact/', '/disclosure/', '/privacy-policy/'];

const staticEntries = (): MetadataRoute.Sitemap =>
  STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` }));

const toDate = (value?: string): Date | undefined => (value ? new Date(value) : undefined);

// 実行時の取得失敗は throw して ISR に前回のキャッシュを出し続けさせる（記事の消えたサイトマップを出さない）。
// ビルド中は API キーが無効でもビルドを通すため、失敗した分だけ空にして続ける
// （tags だけ失敗したときに記事まで落とさない）。
const settle = (result: PromiseSettledResult<ContentMeta[]>, endpoint: string): ContentMeta[] => {
  if (result.status === 'fulfilled') return result.value;
  if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) throw result.reason;
  console.warn(`Failed to fetch ${endpoint} for sitemap. Omitting them.`, result.reason);
  return [];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogResult, tagsResult] = await Promise.allSettled([
    getAllContentMeta('blog'),
    getAllContentMeta('tags'),
  ]);
  const articles = settle(blogResult, 'blog');
  const tags = settle(tagsResult, 'tags');

  return [
    ...staticEntries(),
    ...articles.map((a) => ({
      url: `${SITE_URL}/articles/${a.id}/`,
      lastModified: toDate(a.updatedAt ?? a.publishedAt),
    })),
    ...tags.map((t) => ({
      url: `${SITE_URL}/tags/${t.id}/`,
      lastModified: toDate(t.updatedAt),
    })),
  ];
}
