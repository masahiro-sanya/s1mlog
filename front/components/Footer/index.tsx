import Link from 'next/link';
import styles from './index.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.links} aria-label="フッターナビゲーション">
        <Link href="/">ホーム</Link>
        <span className={styles.sep}>/</span>
        <Link href="/privacy-policy">プライバシーポリシー</Link>
        <span className={styles.sep}>/</span>
        <Link href="/contact">お問い合わせ</Link>
      </nav>
      <p className={styles.cr}>© S1MLOG. All Rights Reserved 2024</p>
    </footer>
  );
}
