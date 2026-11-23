import { cache } from 'react';
import type { Metadata } from 'next';
import { getAllContentIds, getListOrThrow, getTag, LIST_FIELDS } from '@/libs/microcms';
import { LIMIT } from '@/constants';
import Pagination from '@/components/Pagination';
import ArticleList from '@/components/ArticleList';

type Props = {
  params: Promise<{
    tagId: string;
  }>;
};

export const revalidate = 60;

// generateMetadata と Page で共有し、同じリクエスト内の取得を 1 回にまとめる。
// 取得失敗は null を返す（失敗を 0 本と取り違えて noindex にしないため）。
const getTagArticles = cache(async (tagId: string) => {
  try {
    return await getListOrThrow({
      limit: LIMIT,
      filters: `tags[contains]${tagId}`,
      fields: LIST_FIELDS,
    });
  } catch (error) {
    console.error(`Error fetching tag articles (${tagId}):`, error);
    return null;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tagId } = await params;
  const [tag, data] = await Promise.all([getTag(tagId), getTagArticles(tagId)]);
  // 公開記事が 0 本のタグは中身の無いページなので検索に出さない（サイトマップからも外している）。
  // 取得に失敗したとき（data が null）は本数が分からないので指定しない。
  const robots = data?.totalCount === 0 ? { index: false, follow: true } : undefined;
  if (!tag) {
    return { alternates: { canonical: `/tags/${tagId}` }, ...(robots && { robots }) };
  }
  return {
    title: `${tag.name} の記事一覧`,
    description: `${tag.name} に関する記事一覧。`,
    alternates: { canonical: `/tags/${tagId}` },
    ...(robots && { robots }),
  };
}

export async function generateStaticParams() {
  const tagIds = await getAllContentIds('tags');
  return tagIds.map((tagId) => ({ tagId }));
}

export default async function Page({ params }: Props) {
  const { tagId } = await params;
  const data = await getTagArticles(tagId);

  return (
    <>
      <ArticleList articles={data?.contents ?? []} />
      <Pagination totalCount={data?.totalCount ?? 0} basePath={`/tags/${tagId}`} />
    </>
  );
}
