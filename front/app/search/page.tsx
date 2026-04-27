import type { Metadata } from 'next';
import { getList } from '@/libs/microcms';
import ArticleList from '@/components/ArticleList';
import Pagination from '@/components/Pagination';
import { LIMIT } from '@/constants';

type Props = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

export const revalidate = 60;

export const metadata: Metadata = {
  title: '検索',
  robots: { index: false, follow: true },
  alternates: { canonical: '/search' },
};

export default async function Page({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);

  const data = await getList({
    q: resolvedSearchParams.q,
    limit: LIMIT,
    offset: LIMIT * (page - 1),
  });

  return (
    <>
      <ArticleList articles={data.contents} />
      <Pagination
        totalCount={data.totalCount}
        current={page}
        basePath="/search"
        q={resolvedSearchParams.q}
      />
    </>
  );
}
