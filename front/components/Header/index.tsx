import Image from 'next/image';
import Link from 'next/link';
import styles from './index.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/">
        <Image
          src="/logo.svg"
          alt="s1mlog"
          className={styles.logo}
          width={220}
          height={56}
          priority
        />
      </Link>
    </header>
  );
}
