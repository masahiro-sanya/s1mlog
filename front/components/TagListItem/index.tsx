import Link from 'next/link';
import { Tag } from '@/libs/microcms';
import styles from './index.module.css';

type Props = {
  tag: Tag;
  hasLink?: boolean;
};

const VARIANTS = ['v1', 'v2', 'v3', 'v4', 'v5'] as const;

function variantOf(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return VARIANTS[h % VARIANTS.length];
}

export default function TagListItem({ tag, hasLink = true }: Props) {
  const variant = styles[variantOf(tag.id || tag.name)];
  const className = `${styles.tag} ${variant}`;
  if (hasLink) {
    return (
      <Link href={`/tags/${tag.id}`} className={className}>
        #{tag.name}
      </Link>
    );
  }
  return <span className={className}>#{tag.name}</span>;
}
