import { getList } from '@/libs/microcms';
import ArticleList from '@/components/ArticleList';
import Pagination from '@/components/Pagination';
import { LIMIT } from '@/constants';

type Props = {
  params: Promise<{ current: string }>;
  searchParams: Promise<{ q?: string }>;
};

export const revalidate = 60;

export default async function Page({ params, searchParams }: Props) {
  const { current } = await params;
  const { q } = await searchParams;
  const page = parseInt(current || '1', 10);

  const data = await getList({ q, limit: LIMIT, offset: LIMIT * (page - 1) });

  return (
    <>
      <ArticleList articles={data.contents} />
      <Pagination totalCount={data.totalCount} current={page} basePath="/search" q={q} />
    </>
  );
}

