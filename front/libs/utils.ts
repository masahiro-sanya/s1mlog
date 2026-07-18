import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';
// highlight.js はフルビルド（約190言語）を避け、ブログで使う言語のみ登録する
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import diff from 'highlight.js/lib/languages/diff';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import go from 'highlight.js/lib/languages/go';
import ini from 'highlight.js/lib/languages/ini';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import plaintext from 'highlight.js/lib/languages/plaintext';
import python from 'highlight.js/lib/languages/python';
import shell from 'highlight.js/lib/languages/shell';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('diff', diff);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('go', go);
hljs.registerLanguage('ini', ini); // toml も alias で対応
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('python', python);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml); // html も alias で対応
hljs.registerLanguage('yaml', yaml);

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

// iframe の埋め込みを許可するホスト（動画・スライド等の正規プロバイダのみ）
const ALLOWED_IFRAME_HOSTS = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'docs.google.com',
  'speakerdeck.com',
  'www.speakerdeck.com',
  'codepen.io',
  'platform.twitter.com',
  'www.slideshare.net',
  'codesandbox.io',
];

// CMS 本文（オーナー入力だが CMS 侵害・共同ライター・外部貼付を想定）をサニタイズする。
// script / on* ハンドラ / javascript: スキーム / 未許可ホストの iframe を除去し、
// 既存記事の構造（見出し・コードブロック・リンク・表・画像・許可 iframe）は温存する。
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img',
    'h1',
    'h2',
    'figure',
    'figcaption',
    'picture',
    'source',
    'iframe',
    'span',
    'sup',
    'sub',
    'del',
    'ins',
    'u',
    's',
    'mark',
    'details',
    'summary',
    'section',
    'article',
    'video',
    'audio',
  ]),
  allowedAttributes: {
    '*': ['id', 'class', 'style'],
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'srcset', 'sizes', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
    source: ['src', 'srcset', 'type', 'media', 'sizes'],
    iframe: [
      'src',
      'width',
      'height',
      'allow',
      'allowfullscreen',
      'frameborder',
      'loading',
      'title',
      'referrerpolicy',
    ],
    video: ['src', 'width', 'height', 'controls', 'poster', 'preload'],
    audio: ['src', 'controls', 'preload'],
    code: ['class'],
    ol: ['start', 'type'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan', 'scope'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  allowedIframeHostnames: ALLOWED_IFRAME_HOSTS,
  // style 属性は残すが、値をホワイトリストで制限し url(javascript:) 等を排除する
  allowedStyles: {
    '*': {
      'text-align': [/^(left|right|center|justify)$/],
      color: [/^#(0x)?[0-9a-f]+$/i, /^rgba?\([\d.,\s%]+\)$/i, /^[a-z-]+$/i],
      'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgba?\([\d.,\s%]+\)$/i, /^[a-z-]+$/i],
      'font-weight': [/^(bold|bolder|lighter|normal|\d+)$/i],
      'text-decoration': [/^[a-z-\s]+$/i],
    },
  },
};

/**
 * リッチテキストをHTML形式にフォーマットする
 * @param richText - リッチテキスト文字列
 * @returns フォーマット済みのHTML文字列
 */
export const formatRichText = (richText: string): string => {
  if (!richText || typeof richText !== 'string') return ''; // `richText`が文字列でない場合のチェック

  try {
    // まず危険なマークアップを除去してから整形する（XSS の主防御）
    const sanitized = sanitizeHtml(richText, SANITIZE_OPTIONS);
    const $ = cheerio.load(sanitized); // Cheerioインスタンスを生成

    /**
     * ハイライト処理を適用
     * @param text - 対象コード文字列
     * @param lang - 使用言語クラス
     * @returns ハイライト済みのHTML文字列
     */
    const highlight = (text: string, lang?: string): string => {
      if (!text) return ''; // テキストが空の場合は何もしない
      if (!lang) return hljs.highlightAuto(text).value; // 言語が指定されていない場合は登録済み言語から自動検出

      try {
        return hljs.highlight(text, { language: lang.replace(/^language-/, '') }).value;
      } catch (e) {
        console.warn('Error highlighting text with specific language:', e);
        return hljs.highlightAuto(text).value; // 未登録言語などのエラー時は自動検出
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
