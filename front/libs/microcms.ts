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

// ユーザー指定の filters は括弧で囲む。[and] と [or] の優先順位は公式ドキュメントに書かれていない。
// 囲まないと `[or]` を含む条件（関連記事のタグ OR 検索など）で下書きが返ることを、実 API で確かめた。
const mergeWithPublishedFilter = (userFilters?: string): string =>
  userFilters ? `${PUBLISHED_FILTER}[and](${userFilters})` : PUBLISHED_FILTER;

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
      const article = await client.getListDetail<Blog>({
        endpoint: 'blog',
        contentId,
        queries,
      });
      // API キーが下書きも返すため、draftKey なしで未公開の記事を開いたときは見つからない扱いにする
      if (!queries?.draftKey && !article.publishedAt) {
        return null;
      }
      return article;
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

// microCMS の 1 リクエスト上限である 100 件ずつページングして全件取得する。
const ALL_IDS_PAGE_SIZE = 100;

// 全件をページングして取得する。失敗は throw する（握りつぶすかどうかは呼び出し側で決める）。
const fetchAllPages = async <T>(
  endpoint: 'blog' | 'tags',
  fields: string,
  filters?: string,
): Promise<(T & MicroCMSContentId & MicroCMSDate)[]> => {
  const contents: (T & MicroCMSContentId & MicroCMSDate)[] = [];
  let offset = 0;
  for (;;) {
    const res = await client.getList<T>({
      endpoint,
      queries: {
        fields,
        limit: ALL_IDS_PAGE_SIZE,
        offset,
        ...(filters ? { filters } : {}),
      },
    });
    contents.push(...res.contents);
    offset += ALL_IDS_PAGE_SIZE;
    if (offset >= res.totalCount) break;
  }
  return contents;
};

// 全コンテンツの ID を取得する（generateStaticParams 用）。
export const getAllContentIds = async (
  endpoint: 'blog' | 'tags',
  filters?: string,
): Promise<string[]> => {
  if (!isConfigured()) {
    return [];
  }

  const mergedFilters = endpoint === 'blog' ? mergeWithPublishedFilter(filters) : filters;

  try {
    const contents = await fetchAllPages<object>(endpoint, 'id', mergedFilters);
    return contents.map((c) => c.id);
  } catch (error) {
    console.error(`Error fetching all content ids (${endpoint}):`, error);
    return [];
  }
};

// サイトマップ用のメタ情報（id と更新日時）
export type ContentMeta = {
  id: string;
  updatedAt?: string;
  publishedAt?: string;
};

// 全コンテンツのメタ情報を取得する（sitemap 用）。
// 取得失敗は throw する（「失敗」と「0 件」を区別するため。フォールバックは呼び出し側で決める）。
// 未設定（isConfigured() が false）は失敗ではないので空配列を返す。
export const getAllContentMeta = async (endpoint: 'blog' | 'tags'): Promise<ContentMeta[]> => {
  if (!isConfigured()) {
    return [];
  }

  const filters = endpoint === 'blog' ? mergeWithPublishedFilter() : undefined;
  const contents = await fetchAllPages<object>(endpoint, 'id,updatedAt,publishedAt', filters);
  return contents.map((c) => ({ id: c.id, updatedAt: c.updatedAt, publishedAt: c.publishedAt }));
};
