import { notFound } from 'next/navigation';
import { getTag } from '@/libs/microcms';
import TagListItem from '@/components/TagListItem';
import styles from './layout.module.css';

type Props = {
  children: React.ReactNode;
  params: Promise<{
    tagId: string;
  }>;
};

export default async function TagsLayout({ children, params }: Props) {
  const { tagId } = await params;
  const tag = await getTag(tagId);
  if (!tag) {
    notFound();
  }
  return (
    <div>
      <p className={styles.title}>
        <TagListItem tag={tag} hasLink={false} />
        の記事一覧
      </p>
      <div>{children}</div>
    </div>
  );
}
