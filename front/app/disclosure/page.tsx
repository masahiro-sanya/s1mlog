import type { Metadata } from 'next';
import styles from '../privacy-policy/page.module.css';

export const metadata: Metadata = {
  title: 'アフィリエイト・広告に関する開示 | S1MLOG',
  description:
    'S1MLOG における Google AdSense などのディスプレイ広告、Amazon アソシエイト等のアフィリエイトリンクの取り扱い・開示方針について記載しています。',
  alternates: { canonical: '/disclosure' },
};

export default function DisclosurePage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>アフィリエイト・広告に関する開示</h1>

      <p>
        S1MLOG（以下「当サイト」）は、コンテンツ提供にかかる運営費用の補填および継続的な情報発信のために、第三者配信のディスプレイ広告およびアフィリエイトプログラムを利用しています。本ページでは、景品表示法に基づく表示（いわゆるステマ規制）の観点から、当サイトの広告・アフィリエイトに関する取り扱い方針を開示します。
      </p>

      <h2 className={styles.sectionTitle}>ディスプレイ広告について</h2>
      <p>
        当サイトでは第三者配信の広告サービス（Google
        AdSense等）を利用しています。これらの広告は、ユーザーの興味に応じた商品・サービスの広告を表示するためにCookie等を使用することがあります。広告配信に関する詳細はGoogleの
        <a
          href="https://policies.google.com/technologies/ads?hl=ja"
          target="_blank"
          rel="noopener noreferrer"
        >
          広告ポリシー
        </a>
        をご確認ください。
      </p>

      <h2 className={styles.sectionTitle}>アフィリエイトプログラムへの参加</h2>
      <p>
        当サイトは以下のアフィリエイトプログラムに参加しています。商品・サービスを当サイト経由でご購入いただくと、運営者に紹介料が支払われることがあります。
      </p>
      <ul className={styles.list}>
        <li>Amazon.co.jp アソシエイト</li>
        <li>楽天アフィリエイト</li>
        <li>もしもアフィリエイト</li>
        <li>バリューコマース、A8.net、アクセストレード 等の各種ASP</li>
      </ul>
      <p>
        当サイトは Amazon.co.jp
        を宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazon
        アソシエイト・プログラムの参加者です。
      </p>

      <h2 className={styles.sectionTitle}>記事への表示について</h2>
      <p>
        当サイトでは、アフィリエイトリンクを含む記事および広告枠を含むページに「PR」表示を行います。記事内のアフィリエイトリンクには
        <code>rel=&quot;sponsored&quot;</code>
        を自動付与しており、検索エンジンに対して商業的関係性を明示しています。
      </p>

      <h2 className={styles.sectionTitle}>コンテンツの中立性について</h2>
      <p>
        紹介する商品・サービスの選定および記事内容については、運営者自身の使用経験・調査結果・公開情報に基づいて記載しています。アフィリエイト報酬の有無や金額によって評価内容を恣意的に操作することはありません。ただし、誤情報や古い情報が含まれる可能性があるため、最終的なご購入・ご利用判断は読者ご自身でお願いします。
      </p>

      <h2 className={styles.sectionTitle}>免責事項</h2>
      <p>
        当サイトで紹介する商品・サービスに関するトラブル・損害について、当サイトでは責任を負いかねます。各サービスの利用規約・販売事業者の表示をご確認のうえご利用ください。
      </p>

      <p className={styles.updatedAt}>制定日：2026年5月</p>
    </div>
  );
}
