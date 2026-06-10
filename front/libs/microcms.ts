import { cache } from 'react';
import { createClient } from 'microcms-js-sdk';
import type {
  MicroCMSQueries,
  MicroCMSImage,
  MicroCMSDate,
  MicroCMSContentId,
} from 'microcms-js-sdk';

// タグの型定義
export type Tag = {
  name: string;
} & MicroCMSContentId &
  MicroCMSDate;

// ライターの型定義
export type Writer = {
  name: string;
  profile: string;
  image?: MicroCMSImage;
} & MicroCMSContentId &
  MicroCMSDate;

// ブログの型定義
export type Blog = {
  title: string;
  description: string;
  content: string;
  thumbnail?: MicroCMSImage;
  tags?: Tag[];
  writer?: Writer;
};

export type Article = Blog & MicroCMSContentId & MicroCMSDate;

// 一覧表示で必要なフィールドのみを取得するための fields 指定（content 全文を除外して転送量を抑える）
export const LIST_FIELDS = 'id,title,description,thumbnail,tags,publishedAt,createdAt,updatedAt';

// ビルド時のチェック - Vercelビルド時は環境変数がない可能性がある
const isConfigured = (): boolean =>
  Boolean(process.env.MICROCMS_SERVICE_DOMAIN) &&
  Boolean(process.env.MICROCMS_API_KEY) &&
  process.env.MICROCMS_SERVICE_DOMAIN !== 'dummy' &&
  process.env.MICROCMS_API_KEY !== 'dummy';

if (!isConfigured()) {
  console.warn('MicroCMS credentials not configured. Using dummy values for build.');
}

export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || 'dummy',
  apiKey: process.env.MICROCMS_API_KEY || 'dummy',
});

const emptyList = <T>() => ({ contents: [] as T[], totalCount: 0, offset: 0, limit: 0 });

const DEFAULT_WRITER: Writer = {
  id: 'default',
  name: 'Default Writer',
  profile: 'No profile available',
  createdAt: '',
  updatedAt: '',
  publishedAt: '',
};

// 下書きを除外するための microCMS フィルタ。publishedAt が存在するもののみ返す。
// 現状の API キーは権限上下書きも返してしまうため、フロント側で明示的に弾く必要がある。
const PUBLISHED_FILTER = 'publishedAt[exists]';

const mergeWithPublishedFilter = (userFilters?: string): string =>
  userFilters ? `${PUBLISHED_FILTER}[and]${userFilters}` : PUBLISHED_FILTER;

// ブログ一覧を取得
export const getList = async (queries?: MicroCMSQueries) => {
  if (!isConfigured()) {
    return emptyList<Article>();
  }

  try {
    return await client.getList<Blog>({
      endpoint: 'blog',
      queries: { ...queries, filters: mergeWithPublishedFilter(queries?.filters) },
    });
  } catch (error) {
    console.error('Error fetching blog list:', error);
    return emptyList<Article>();
  }
};

// ブログの詳細を取得。見つからない/エラー時は null を返す（404 判断は呼び出し側で行う）
export const getDetail = cache(
  async (contentId: string, queries?: MicroCMSQueries): Promise<Article | null> => {
    if (!isConfigured()) {
      return null;
    }

    try {
      return await client.getListDetail<Blog>({
        endpoint: 'blog',
        contentId,
        queries,
      });
    } catch (error) {
      console.error(`Error fetching blog detail (${contentId}):`, error);
      return null;
    }
  },
);

// タグの一覧を取得
export const getTagList = async (queries?: MicroCMSQueries) => {
  if (!isConfigured()) {
    return emptyList<Tag>();
  }

  try {
    return await client.getList<Tag>({
      endpoint: 'tags',
      queries,
    });
  } catch (error) {
    console.error('Error fetching tag list:', error);
    return emptyList<Tag>();
  }
};

// タグの詳細を取得。見つからない/エラー時は null を返す（404 判断は呼び出し側で行う）
export const getTag = cache(
  async (contentId: string, queries?: MicroCMSQueries): Promise<Tag | null> => {
    if (!isConfigured()) {
      return null;
    }

    try {
      return await client.getListDetail<Tag>({
        endpoint: 'tags',
        contentId,
        queries,
      });
    } catch (error) {
      console.error(`Error fetching tag detail (${contentId}):`, error);
      return null;
    }
  },
);

// ライター情報を取得（先頭の1件）。未登録時は null、エラー時はデフォルト値を返す
export const getWriter = async (): Promise<Writer | null> => {
  if (!isConfigured()) {
    return DEFAULT_WRITER;
  }

  try {
    const writerData = await client.getList<Writer>({
      endpoint: 'writers',
      queries: { limit: 1 },
    });
    return writerData.contents[0] ?? null;
  } catch (error) {
    console.error('Error fetching writers:', error);
    return DEFAULT_WRITER;
  }
};

// 全コンテンツの ID を取得する（generateStaticParams 用）。
// microCMS の 1 リクエスト上限である 100 件ずつページングして全件取得する。
const ALL_IDS_PAGE_SIZE = 100;

export const getAllContentIds = async (
  endpoint: 'blog' | 'tags',
  filters?: string,
): Promise<string[]> => {
  if (!isConfigured()) {
    return [];
  }

  const mergedFilters = endpoint === 'blog' ? mergeWithPublishedFilter(filters) : filters;

  try {
    const ids: string[] = [];
    let offset = 0;
    for (;;) {
      const res = await client.getList<Record<string, never>>({
        endpoint,
        queries: {
          fields: 'id',
          limit: ALL_IDS_PAGE_SIZE,
          offset,
          ...(mergedFilters ? { filters: mergedFilters } : {}),
        },
      });
      ids.push(...res.contents.map((c) => c.id));
      offset += ALL_IDS_PAGE_SIZE;
      if (offset >= res.totalCount) break;
    }
    return ids;
  } catch (error) {
    console.error(`Error fetching all content ids (${endpoint}):`, error);
    return [];
  }
};
