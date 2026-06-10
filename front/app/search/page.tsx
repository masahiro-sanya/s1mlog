import type { Metadata } from 'next';
import { getList, LIST_FIELDS } from '@/libs/microcms';
import ArticleList from '@/components/ArticleList';
import Pagination from '@/components/Pagination';
import { LIMIT } from '@/constants';

type Props = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export const revalidate = 60;

export const metadata: Metadata = {
  title: '検索',
  robots: { index: false, follow: true },
  alternates: { canonical: '/search' },
};

export default async function Page({ searchParams }: Props) {
  const { q } = await searchParams;

  const data = await getList({
    q,
    limit: LIMIT,
    fields: LIST_FIELDS,
  });

  return (
    <>
      <ArticleList articles={data.contents} />
      <Pagination totalCount={data.totalCount} basePath="/search" q={q} />
    </>
  );
}
