import * as cheerio from 'cheerio';

export type Heading = {
  id: string;
  text: string;
  level: number;
};

const slugify = (raw: string, fallbackIndex: number): string => {
  const base = raw
    .normalize('NFKD')
    .replace(/[　\s]+/g, '-')
    .replace(/[^\w぀-ヿ一-龯ー-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return base || `heading-${fallbackIndex}`;
};

// 正規表現に埋め込む文字列のメタ文字をエスケープする
const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const buildTocHtml = (
  html: string,
): { headings: Heading[]; firstHalfHtml: string; secondHalfHtml: string } => {
  if (!html) return { headings: [], firstHalfHtml: '', secondHalfHtml: '' };
  const $ = cheerio.load(html);
  const headings: Heading[] = [];
  const usedIds = new Set<string>();

  $('h2, h3').each((index, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    if (!text) return;
    const tagName = el.tagName?.toLowerCase?.() || $el.prop('tagName')?.toLowerCase() || 'h2';
    const level = tagName === 'h3' ? 3 : 2;
    let id = $el.attr('id') || slugify(text, index);
    let suffix = 1;
    while (usedIds.has(id)) {
      id = `${id}-${suffix++}`;
    }
    usedIds.add(id);
    $el.attr('id', id);
    headings.push({ id, text, level });
  });

  // 記事中盤に広告を挿入できるよう、本文を「中央付近の H2」で前半・後半に分割する。
  // H2 が 2 未満の短い記事では分割しない（後半に全体を入れて前半を空にする）。
  const h2Headings = headings.filter((h) => h.level === 2);
  const fullHtml = $.html();
  let firstHalfHtml = '';
  let secondHalfHtml = fullHtml;

  if (h2Headings.length >= 2) {
    const midIndex = Math.floor(h2Headings.length / 2);
    const splitId = h2Headings[midIndex].id;
    const re = new RegExp(`<h2\\b[^>]*\\bid=["']${escapeRegExp(splitId)}["'][^>]*>`, 'i');
    const m = fullHtml.match(re);
    if (m && m.index !== undefined) {
      firstHalfHtml = fullHtml.slice(0, m.index);
      secondHalfHtml = fullHtml.slice(m.index);
    }
  }

  return { headings, firstHalfHtml, secondHalfHtml };
};
