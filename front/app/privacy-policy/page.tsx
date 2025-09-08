import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | S1MLOG',
  description:
    'S1MLOGのプライバシーポリシー。アクセス解析・広告（Google アナリティクス / Google AdSense）に関する情報を掲載しています。',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>プライバシーポリシー</h1>

      <p>
        S1MLOG（以下「当サイト」）では、より良いコンテンツの提供およびユーザー体験の向上のため、アクセス解析や広告配信においてCookie等を使用する場合があります。本ポリシーでは、取得する情報とその利用目的、第三者提供、問い合わせ先について記載します。
      </p>

      <h2 className={styles.sectionTitle}>アクセス解析について</h2>
      <p>
        当サイトでは、Google アナリティクスを利用してサイトの利用状況を分析しています。Google
        アナリティクスはCookieを使用して匿名のトラフィックデータを収集します。詳細は、
        <a href="https://marketingplatform.google.com/about/analytics/terms/jp/" target="_blank" rel="noopener noreferrer">
          Google アナリティクス利用規約
        </a>
        および
        <a href="https://policies.google.com/privacy?hl=ja" target="_blank" rel="noopener noreferrer">
          Googleプライバシーポリシー
        </a>
        をご確認ください。
      </p>

      <h2 className={styles.sectionTitle}>広告配信（Google AdSense）について</h2>
      <p>
        当サイトは第三者配信の広告サービスであるGoogle AdSenseを使用する場合があります。Googleなどの第三者配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。パーソナライズド広告に使用されるCookieを無効にする方法等の詳細は、
        <a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener noreferrer">
          広告 – ポリシーと規約（Google）
        </a>
        をご確認ください。
      </p>

      <h2 className={styles.sectionTitle}>個人情報の利用目的</h2>
      <ul className={styles.list}>
        <li>お問い合わせ対応のため</li>
        <li>品質改善・不具合対応のための分析</li>
        <li>不正アクセスの防止等セキュリティ確保のため</li>
      </ul>

      <h2 className={styles.sectionTitle}>第三者への開示・提供</h2>
      <p>
        法令に基づく場合を除き、本人の同意なく個人情報を第三者に提供することはありません。
      </p>

      <h2 className={styles.sectionTitle}>プライバシーポリシーの変更</h2>
      <p>
        本ポリシーの内容は、法令の変更や運用状況に応じて、予告なく変更される場合があります。
      </p>

      <p className={styles.updatedAt}>制定日：2024年9月</p>
    </div>
  );
}

