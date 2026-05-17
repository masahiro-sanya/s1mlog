import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import * as cheerio from 'cheerio';
import hljs from 'highlight.js';
import 'highlight.js/styles/hybrid.css';

/**
 * 日付をフォーマットする
 * @param date - UTC形式の日付文字列
 * @returns フォーマット済みの日付文字列 (例: "10 December, 2024")
 */
export const formatDate = (date: string): string => {
  if (!date) return ''; // `date`が存在しない場合は空文字を返す
  try {
    const utcDate = new Date(date);
    if (isNaN(utcDate.getTime())) throw new Error('Invalid date format'); // 無効な日付チェック
    const jstDate = toZonedTime(utcDate, 'Asia/Tokyo');
    return format(jstDate, 'd MMMM, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return ''; // エラー時は空文字を返す
  }
};

// アフィリエイト判定対象のドメイン断片。判定はホスト名の含有チェックで行う（サブドメイン許容）
const AFFILIATE_HOST_PATTERNS = [
  'amzn.to',
  'amazon.co.jp',
  'amazon.com',
  'amazon.jp',
  'rakuten.co.jp',
  'rakuten.ne.jp',
  'a8.net',
  'px.a8.net',
  'valuecommerce.com',
  'mkt-valuecommerce.com',
  'moshimo.com',
  'af.moshimo.com',
  'linksynergy.com',
  'click.linksynergy.com',
  'iherb.com',
  'tcs-asp.net', // アクセストレード
  'felmat.net',
];

const isAffiliateUrl = (url: string): boolean => {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return AFFILIATE_HOST_PATTERNS.some((p) => host === p || host.endsWith(`.${p}`));
  } catch {
    return false;
  }
};

/**
 * リッチテキストをHTML形式にフォーマットする
 * @param richText - リッチテキスト文字列
 * @returns フォーマット済みのHTML文字列
 */
export const formatRichText = (richText: string): string => {
  if (!richText || typeof richText !== 'string') return ''; // `richText`が文字列でない場合のチェック

  try {
    const $ = cheerio.load(richText); // Cheerioインスタンスを生成

    /**
     * ハイライト処理を適用
     * @param text - 対象コード文字列
     * @param lang - 使用言語クラス
     * @returns ハイライト済みのHTML文字列
     */
    const highlight = (text: string, lang?: string): string => {
      if (!text) return ''; // テキストが空の場合は何もしない
      if (!lang) return hljs.highlightAuto(text).value; // 言語が指定されていない場合は自動検出

      try {
        return hljs.highlight(text, { language: lang.replace(/^language-/, '') }).value;
      } catch (e) {
        console.warn('Error highlighting text with specific language:', e);
        return hljs.highlightAuto(text).value; // エラー時は自動検出
      }
    };

    // `<pre><code>` 内のコードブロックにハイライト処理を適用
    $('pre code').each((_, elm) => {
      const lang = $(elm).attr('class');
      const res = highlight($(elm).text(), lang);
      $(elm).html(res);
    });

    // アフィリエイト・広告系の外部リンクに rel="sponsored nofollow noopener" を自動付与し、
    // target="_blank" も併せて付ける（景表法ステマ規制 / Google ガイドライン対応）
    $('a[href^="http"]').each((_, elm) => {
      const $a = $(elm);
      const href = $a.attr('href') || '';
      if (!isAffiliateUrl(href)) return;
      const existingRel = ($a.attr('rel') || '').split(/\s+/).filter(Boolean);
      const merged = Array.from(new Set([...existingRel, 'sponsored', 'nofollow', 'noopener']));
      $a.attr('rel', merged.join(' '));
      if (!$a.attr('target')) $a.attr('target', '_blank');
      $a.attr('data-affiliate', 'true');
    });

    return $.html(); // 変更されたHTMLを返す
  } catch (error) {
    console.error('Error formatting rich text:', error); // エラーをログに出力
    return ''; // エラー時は空文字を返す
  }
};
