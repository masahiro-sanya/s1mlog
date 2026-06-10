import { formatRichText } from '../utils';

describe('formatRichText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('空の文字列を処理できる', () => {
    expect(formatRichText('')).toBe('');
  });

  it('null など文字列以外は空文字を返す', () => {
    expect(formatRichText(null as any)).toBe('');
    expect(formatRichText(undefined as any)).toBe('');
  });

  it('プレーンテキストを内容を保ったまま返す', () => {
    const text = 'This is plain text';
    expect(formatRichText(text)).toContain(text);
  });

  describe('コードハイライト', () => {
    it('言語指定のコードブロックをハイライトする', () => {
      const html = `<pre><code class="language-javascript">const test = 'hello';</code></pre>`;
      const result = formatRichText(html);

      // 実際の highlight.js によって span が挿入される
      expect(result).toContain('hljs-keyword');
      expect(result).toContain('const');
    });

    it('言語指定なしのコードブロックは自動検出でハイライトする', () => {
      const html = `<pre><code>{"key": "value"}</code></pre>`;
      const result = formatRichText(html);

      expect(result).toContain('<span class="hljs-');
    });

    it('未登録の言語が指定された場合は警告を出して自動検出にフォールバックする', () => {
      const html = `<pre><code class="language-unknownlang">some code here</code></pre>`;
      const result = formatRichText(html);

      expect(console.warn).toHaveBeenCalledWith(
        'Error highlighting text with specific language:',
        expect.any(Error),
      );
      // 自動検出によるフォールバックで span が挿入されるため、テキスト断片の存在を確認する
      expect(result).toContain('some ');
      expect(result).toContain(' here');
    });

    it('複数のコードブロックをすべて処理する', () => {
      const html = [
        '<p>Some text</p>',
        `<pre><code class="language-typescript">const a: number = 1;</code></pre>`,
        '<p>More text</p>',
        `<pre><code class="language-python">def hello():\n    pass</code></pre>`,
      ].join('');
      const result = formatRichText(html);

      expect(result).toContain('hljs-keyword');
      expect(result).toContain('Some text');
      expect(result).toContain('More text');
    });

    it('HTMLエンティティを含むコードを壊さない', () => {
      const html = `<pre><code class="language-xml">&lt;div&gt;Hello&lt;/div&gt;</code></pre>`;
      const result = formatRichText(html);

      // タグとして解釈されず、エスケープされたまま残る
      expect(result).toContain('&lt;');
      expect(result).toContain('Hello');
    });
  });

  describe('アフィリエイトリンク', () => {
    it('アフィリエイトURLに rel="sponsored nofollow noopener" と target="_blank" を付与する', () => {
      const html = `<p><a href="https://amzn.to/abc123">商品リンク</a></p>`;
      const result = formatRichText(html);

      expect(result).toMatch(/rel="sponsored nofollow noopener"/);
      expect(result).toMatch(/target="_blank"/);
      expect(result).toMatch(/data-affiliate="true"/);
    });

    it('サブドメイン付きのアフィリエイトURLも判定できる', () => {
      const html = `<p><a href="https://www.amazon.co.jp/dp/B000000000">Amazon</a></p>`;
      const result = formatRichText(html);

      expect(result).toMatch(/rel="sponsored nofollow noopener"/);
    });

    it('既存の rel 属性とマージし、重複させない', () => {
      const html = `<p><a href="https://a8.net/xyz" rel="noopener">広告</a></p>`;
      const result = formatRichText(html);

      expect(result).toMatch(/rel="noopener sponsored nofollow"/);
    });

    it('既に target が指定されている場合は上書きしない', () => {
      const html = `<p><a href="https://amzn.to/abc" target="_self">リンク</a></p>`;
      const result = formatRichText(html);

      expect(result).toMatch(/target="_self"/);
    });

    it('アフィリエイト以外の外部リンクには何も付与しない', () => {
      const html = `<p><a href="https://example.com/page">通常リンク</a></p>`;
      const result = formatRichText(html);

      expect(result).not.toMatch(/rel=/);
      expect(result).not.toMatch(/data-affiliate/);
    });

    it('相対リンクには何も付与しない', () => {
      const html = `<p><a href="/articles/some-post">内部リンク</a></p>`;
      const result = formatRichText(html);

      expect(result).not.toMatch(/data-affiliate/);
    });
  });
});
