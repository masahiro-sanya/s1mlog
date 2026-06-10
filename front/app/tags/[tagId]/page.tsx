import type { Metadata } from 'next';
import { getAllContentIds, getList, getTag, LIST_FIELDS } from '@/libs/microcms';
import { LIMIT } from '@/constants';
import Pagination from '@/components/Pagination';
import ArticleList from '@/components/ArticleList';

type Props = {
  params: Promise<{
    tagId: string;
  }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tagId } = await params;
  const tag = await getTag(tagId);
  if (!tag) {
    return { alternates: { canonical: `/tags/${tagId}` } };
  }
  return {
    title: `${tag.name} の記事一覧`,
    description: `${tag.name} に関する記事一覧。`,
    alternates: { canonical: `/tags/${tagId}` },
  };
}

export async function generateStaticParams() {
  const tagIds = await getAllContentIds('tags');
  return tagIds.map((tagId) => ({ tagId }));
}

export default async function Page({ params }: Props) {
  const { tagId } = await params;
  const data = await getList({
    limit: LIMIT,
    filters: `tags[contains]${tagId}`,
    fields: LIST_FIELDS,
  });

  return (
    <>
      <ArticleList articles={data.contents} />
      <Pagination totalCount={data.totalCount} basePath={`/tags/${tagId}`} />
    </>
  );
}
