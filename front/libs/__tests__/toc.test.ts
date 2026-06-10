import { buildTocHtml } from '../toc';

describe('buildTocHtml', () => {
  it('空のHTMLは空の結果を返す', () => {
    expect(buildTocHtml('')).toEqual({ headings: [], firstHalfHtml: '', secondHalfHtml: '' });
  });

  it('h2 / h3 を見出しとして抽出し、id を付与する', () => {
    const html = '<h2>はじめに</h2><p>text</p><h3>詳細</h3><p>text</p>';
    const { headings, secondHalfHtml } = buildTocHtml(html);

    expect(headings).toHaveLength(2);
    expect(headings[0]).toMatchObject({ text: 'はじめに', level: 2 });
    expect(headings[1]).toMatchObject({ text: '詳細', level: 3 });
    expect(headings[0].id).toBeTruthy();
    // 付与した id が本文側にも反映されている
    expect(secondHalfHtml).toContain(`id="${headings[0].id}"`);
  });

  it('既存の id がある場合はそれを維持する', () => {
    const html = '<h2 id="custom-id">Heading</h2>';
    const { headings } = buildTocHtml(html);

    expect(headings[0].id).toBe('custom-id');
  });

  it('同じテキストの見出しには重複しない id を付与する', () => {
    const html = '<h2>同じ見出し</h2><p>a</p><h2>同じ見出し</h2>';
    const { headings } = buildTocHtml(html);

    expect(headings).toHaveLength(2);
    expect(headings[0].id).not.toBe(headings[1].id);
  });

  it('空テキストの見出しはスキップする', () => {
    const html = '<h2></h2><h2>有効な見出し</h2>';
    const { headings } = buildTocHtml(html);

    expect(headings).toHaveLength(1);
    expect(headings[0].text).toBe('有効な見出し');
  });

  it('h2 が2つ以上ある場合、中央付近の h2 で本文を前半・後半に分割する', () => {
    const html =
      '<h2>第一章</h2><p>one</p><h2>第二章</h2><p>two</p><h2>第三章</h2><p>three</p><h2>第四章</h2><p>four</p>';
    const { headings, firstHalfHtml, secondHalfHtml } = buildTocHtml(html);

    const h2s = headings.filter((h) => h.level === 2);
    const midId = h2s[Math.floor(h2s.length / 2)].id;

    expect(firstHalfHtml).not.toBe('');
    // 後半は中央の h2 から始まる
    expect(secondHalfHtml).toMatch(new RegExp(`^<h2[^>]*id="${midId}"`));
    // 前半・後半を合わせると本文の内容がすべて含まれる
    const combined = firstHalfHtml + secondHalfHtml;
    for (const word of ['one', 'two', 'three', 'four']) {
      expect(combined).toContain(word);
    }
    expect(firstHalfHtml).toContain('one');
    expect(secondHalfHtml).toContain('three');
  });

  it('h2 が1つ以下の場合は分割しない', () => {
    const html = '<h2>唯一の章</h2><p>content</p><h3>小見出し</h3>';
    const { firstHalfHtml, secondHalfHtml } = buildTocHtml(html);

    expect(firstHalfHtml).toBe('');
    expect(secondHalfHtml).toContain('唯一の章');
    expect(secondHalfHtml).toContain('content');
  });

  it('id に正規表現メタ文字が含まれていても分割できる', () => {
    const html = '<h2 id="c++(1)">第一章</h2><p>one</p><h2 id="c++(2)">第二章</h2><p>two</p>';
    const { firstHalfHtml, secondHalfHtml } = buildTocHtml(html);

    expect(firstHalfHtml).toContain('one');
    expect(secondHalfHtml).toContain('two');
  });
});
