import { getList } from '@/libs/microcms';
import { LIMIT } from '@/constants';
import Pagination from '@/components/Pagination';
import ArticleList from '@/components/ArticleList';

type Props = {
  params: Promise<{
    current: string;
  }>;
};

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const data = await getList({
      limit: 1,
    });
    
    const pageCount = Math.ceil(data.totalCount / LIMIT);
    const paths = [];
    
    for (let i = 2; i <= pageCount; i++) {
      paths.push({
        current: i.toString(),
      });
    }
    
    return paths;
  } catch (error) {
    console.error('Error generating static params for pagination:', error);
    return [];
  }
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const current = parseInt(resolvedParams.current as string, 10);
  const data = await getList({
    limit: LIMIT,
    offset: LIMIT * (current - 1),
  });
  return (
    <>
      <ArticleList articles={data.contents} />
      <Pagination totalCount={data.totalCount} current={current} />
    </>
  );
}
