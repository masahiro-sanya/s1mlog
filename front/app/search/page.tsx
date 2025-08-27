import { getList } from '@/libs/microcms';
import ArticleList from '@/components/ArticleList';
import Pagination from '@/components/Pagination';

type Props = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export const revalidate = 60;

export default async function Page({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const data = await getList({
    q: resolvedSearchParams.q,
  });

  return (
    <>
      <ArticleList articles={data.contents} />
      <Pagination totalCount={data.totalCount} basePath="/search" q={resolvedSearchParams.q} />
    </>
  );
}
