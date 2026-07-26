/**
 * @jest-environment node
 */
const nextConfig = require('../next.config.js');

// headers() の中で process.env を読むため、環境変数を切り替えて呼び直せる
const getHeaders = async () => {
  const rules = await nextConfig.headers();
  return Object.fromEntries(rules[0].headers.map((h) => [h.key, h.value]));
};

describe('next.config.js のセキュリティヘッダ', () => {
  const original = process.env.ALLOW_INSECURE_HTTP;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.ALLOW_INSECURE_HTTP;
    } else {
      process.env.ALLOW_INSECURE_HTTP = original;
    }
  });

  it('既定では upgrade-insecure-requests を付ける（本番は https 配信）', async () => {
    delete process.env.ALLOW_INSECURE_HTTP;

    const headers = await getHeaders();

    expect(headers['Content-Security-Policy']).toContain('upgrade-insecure-requests');
  });

  it('ALLOW_INSECURE_HTTP=1 のときだけ upgrade-insecure-requests を外す', async () => {
    process.env.ALLOW_INSECURE_HTTP = '1';

    const headers = await getHeaders();

    expect(headers['Content-Security-Policy']).not.toContain('upgrade-insecure-requests');
  });

  it('1 以外の値では外さない（誤設定で本番の防御が落ちないこと）', async () => {
    process.env.ALLOW_INSECURE_HTTP = 'true';

    const headers = await getHeaders();

    expect(headers['Content-Security-Policy']).toContain('upgrade-insecure-requests');
  });

  it('upgrade-insecure-requests を外しても他の CSP ディレクティブは維持する', async () => {
    process.env.ALLOW_INSECURE_HTTP = '1';

    const csp = (await getHeaders())['Content-Security-Policy'];

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  it('CSP 以外のセキュリティヘッダは環境によらず付与する', async () => {
    process.env.ALLOW_INSECURE_HTTP = '1';

    const headers = await getHeaders();

    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Strict-Transport-Security']).toContain('max-age=63072000');
  });
});
