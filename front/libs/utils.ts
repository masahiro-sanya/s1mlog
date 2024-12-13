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

    return $.html(); // 変更されたHTMLを返す
  } catch (error) {
    console.error('Error formatting rich text:', error); // エラーをログに出力
    return ''; // エラー時は空文字を返す
  }
};
