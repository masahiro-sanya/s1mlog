import { getList } from '@/libs/microcms';
import ArticleList from '@/components/ArticleList';
import Pagination from '@/components/Pagination';

type Props = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

export const revalidate = 60;

export default async function Page({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const { LIMIT } = await import('@/constants');
  
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
