import Link from 'next/link';
import styles from './index.module.css';

type Props = {
  variant?: 'compact' | 'detail';
};

export default function PRDisclosure({ variant = 'compact' }: Props) {
  return (
    <p className={styles.disclosure} role="note">
      <span className={styles.tag} aria-label="広告表示">
        PR
      </span>
      {variant === 'detail' ? (
        <span className={styles.text}>
          本記事には広告（Google
          AdSense）およびアフィリエイトリンクが含まれることがあります。詳しくは
          <Link href="/disclosure" className={styles.link}>
            アフィリエイト開示
          </Link>
          をご覧ください。
        </span>
      ) : (
        <span className={styles.text}>
          本記事には広告・アフィリエイトリンクが含まれることがあります（
          <Link href="/disclosure" className={styles.link}>
            開示
          </Link>
          ）
        </span>
      )}
    </p>
  );
}
