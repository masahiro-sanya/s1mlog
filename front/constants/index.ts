// 1ページの表示件数
export const LIMIT = 10;

// サイト全体のメタ情報
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.s1msys.com';
export const SITE_NAME = 'S1MLOG';
export const SITE_DESCRIPTION =
  'ライブ配信バックエンド・SRE・Claude Code 運用の実体験を記録する技術ブログ';
export const SITE_TWITTER = process.env.NEXT_PUBLIC_SITE_TWITTER || ''; // 例: '@s1msys'
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ''; // 例: 'ca-pub-XXXXXXXXXXXXXXXX'
// GA 測定 ID は env 駆動（本番 ID をソースに直書きしない）。未設定なら GA を読み込まない
// → フォーク/プレビュー配信が本番 GA プロパティへ計測を送るのを防ぐ。
// 本番 Vercel には NEXT_PUBLIC_GA_MEASUREMENT_ID の設定が必須。
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// AdSense 広告スロット ID（未設定のスロットは描画されない）
export const ADSENSE_SLOTS = {
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || '',
  articleTop: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_TOP || '',
  articleMid: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID || '',
  articleBottom: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_BOTTOM || '',
};
