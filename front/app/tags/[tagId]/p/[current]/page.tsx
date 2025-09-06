import { getList, getTagList } from '@/libs/microcms';
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

export async function generateStaticParams() {
  try {
    const tagList = await getTagList();
    const paths = [];
    
    for (const tag of tagList.contents) {
      const data = await getList({
        limit: 1,
        filters: `tags[contains]${tag.id}`,
      });
      
      const pageCount = Math.ceil(data.totalCount / LIMIT);
      
      for (let i = 2; i <= pageCount; i++) {
        paths.push({
          tagId: tag.id,
          current: i.toString(),
        });
      }
    }
    
    return paths;
  } catch (error) {
    console.error('Error generating static params for tag pages:', error);
    return [];
  }
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const { tagId } = resolvedParams;
  const current = parseInt(resolvedParams.current as string, 10);
  const data = await getList({
    limit: LIMIT,
    offset: LIMIT * (current - 1),
    filters: `tags[contains]${tagId}`,
  });
  return (
    <>
      <ArticleList articles={data.contents} />
      <Pagination totalCount={data.totalCount} current={current} basePath={`/tags/${tagId}`} />
    </>
  );
}
