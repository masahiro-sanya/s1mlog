import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getList, LIST_FIELDS } from '@/libs/microcms';
import { parsePageNumber } from '@/libs/pagination';
import ArticleList from '@/components/ArticleList';
import Pagination from '@/components/Pagination';
import { LIMIT } from '@/constants';

type Props = {
  params: Promise<{ current: string }>;
  searchParams: Promise<{ q?: string }>;
};

export const revalidate = 60;

export const metadata: Metadata = {
  title: '検索',
  robots: { index: false, follow: true },
};

export default async function Page({ params, searchParams }: Props) {
  const { current } = await params;
  const { q } = await searchParams;
  const page = parsePageNumber(current);
  if (page === null) {
    notFound();
  }

  const data = await getList({ q, limit: LIMIT, offset: LIMIT * (page - 1), fields: LIST_FIELDS });

  return (
    <>
      <ArticleList articles={data.contents} />
      <Pagination totalCount={data.totalCount} current={page} basePath="/search" q={q} />
    </>
  );
}
