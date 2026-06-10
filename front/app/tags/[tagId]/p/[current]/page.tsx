import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllContentIds, getList, LIST_FIELDS } from '@/libs/microcms';
import { buildPageParams, parsePageNumber } from '@/libs/pagination';
import { LIMIT } from '@/constants';
import Pagination from '@/components/Pagination';
import ArticleList from '@/components/ArticleList';

type Props = {
  params: Promise<{
    tagId: string;
    current: string;
  }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tagId, current } = await params;
  return {
    title: `${current}ページ目`,
    alternates: { canonical: `/tags/${tagId}/p/${current}` },
    robots: { index: false, follow: true },
  };
}

export async function generateStaticParams() {
  const tagIds = await getAllContentIds('tags');
  const paths: { tagId: string; current: string }[] = [];

  for (const tagId of tagIds) {
    const data = await getList({
      limit: 1,
      fields: 'id',
      filters: `tags[contains]${tagId}`,
    });
    for (const { current } of buildPageParams(data.totalCount)) {
      paths.push({ tagId, current });
    }
  }

  return paths;
}

export default async function Page({ params }: Props) {
  const { tagId, current: rawCurrent } = await params;
  const current = parsePageNumber(rawCurrent);
  if (current === null) {
    notFound();
  }
  const data = await getList({
    limit: LIMIT,
    offset: LIMIT * (current - 1),
    filters: `tags[contains]${tagId}`,
    fields: LIST_FIELDS,
  });
  return (
    <>
      <ArticleList articles={data.contents} />
      <Pagination totalCount={data.totalCount} current={current} basePath={`/tags/${tagId}`} />
    </>
  );
}
