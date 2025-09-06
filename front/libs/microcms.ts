import { createClient } from 'microcms-js-sdk';
import type {
  MicroCMSQueries,
  MicroCMSImage,
  MicroCMSDate,
  MicroCMSContentId,
} from 'microcms-js-sdk';
import { notFound } from 'next/navigation';

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



// Initialize Client SDK.
// ビルド時のチェック - Vercelビルド時は環境変数がない可能性がある
const isValidConfig = process.env.MICROCMS_SERVICE_DOMAIN && 
                     process.env.MICROCMS_API_KEY &&
                     process.env.MICROCMS_SERVICE_DOMAIN !== 'dummy' &&
                     process.env.MICROCMS_API_KEY !== 'dummy';

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN || 'dummy';
const apiKey = process.env.MICROCMS_API_KEY || 'dummy';

if (!isValidConfig) {
  console.warn('MicroCMS credentials not configured. Using dummy values for build.');
}

export const client = isValidConfig ? createClient({
  serviceDomain,
  apiKey,
}) : createClient({
  serviceDomain: 'dummy',
  apiKey: 'dummy',
});

// ブログ一覧を取得
export const getList = async (queries?: MicroCMSQueries) => {
  // APIキーが設定されていない場合は空のデータを返す
  if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY ||
      process.env.MICROCMS_SERVICE_DOMAIN === 'dummy' || process.env.MICROCMS_API_KEY === 'dummy') {
    return { contents: [], totalCount: 0, offset: 0, limit: 0 };
  }
  
  try {
    const listData = await client.getList<Blog>({
      endpoint: 'blog',
      queries,
    });
    return listData;
  } catch (error) {
    console.error('Error fetching blog list:', error);
    return { contents: [], totalCount: 0, offset: 0, limit: 0 };
  }
};

// ブログの詳細を取得
export const getDetail = async (contentId: string, queries?: MicroCMSQueries) => {
  // APIキーが設定されていない場合
  if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY ||
      process.env.MICROCMS_SERVICE_DOMAIN === 'dummy' || process.env.MICROCMS_API_KEY === 'dummy') {
    notFound();
  }
  
  try {
    const detailData = await client.getListDetail<Blog>({
      endpoint: 'blog',
      contentId,
      queries,
    });
    return detailData;
  } catch (error) {
    console.error(`Error fetching blog detail (${contentId}):`, error);
    notFound();
  }
};

// タグの一覧を取得
export const getTagList = async (queries?: MicroCMSQueries) => {
  // APIキーが設定されていない場合は空のデータを返す
  if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY ||
      process.env.MICROCMS_SERVICE_DOMAIN === 'dummy' || process.env.MICROCMS_API_KEY === 'dummy') {
    return { contents: [], totalCount: 0, offset: 0, limit: 0 };
  }
  
  try {
    const listData = await client.getList<Tag>({
      endpoint: 'tags',
      queries,
    });
    return listData;
  } catch (error) {
    console.error('Error fetching tag list:', error);
    return { contents: [], totalCount: 0, offset: 0, limit: 0 };
  }
};

// タグの詳細を取得
export const getTag = async (contentId: string, queries?: MicroCMSQueries) => {
  if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY ||
      process.env.MICROCMS_SERVICE_DOMAIN === 'dummy' || process.env.MICROCMS_API_KEY === 'dummy') {
    notFound();
  }
  
  try {
    const detailData = await client.getListDetail<Tag>({
      endpoint: 'tags',
      contentId,
      queries,
    });
    return detailData;
  } catch (error) {
    console.error(`Error fetching tag detail (${contentId}):`, error);
    notFound();
  }
};

export const getWriter = async () => {
  if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY ||
      process.env.MICROCMS_SERVICE_DOMAIN === 'dummy' || process.env.MICROCMS_API_KEY === 'dummy') {
    return {
      id: 'default',
      name: 'Default Writer',
      profile: 'No profile available',
      createdAt: '',
      updatedAt: '',
      publishedAt: '',
    };
  }
  
  try {
    const writerData = await client.get({
      endpoint: 'writers',
    });
    const firstWriter = writerData.contents[0];
    return firstWriter;
  } catch (error) {
    console.error('Error fetching writers:', error);
    // デフォルトのライター情報を返す
    return {
      id: 'default',
      name: 'Default Writer',
      profile: 'No profile available',
      createdAt: '',
      updatedAt: '',
      publishedAt: '',
    };
  }
};
