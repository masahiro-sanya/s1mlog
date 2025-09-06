// jest.setup.js
import '@testing-library/jest-dom';

// Mock環境変数
process.env.MICROCMS_SERVICE_DOMAIN = 'test-domain';
process.env.MICROCMS_API_KEY = 'test-api-key';
process.env.BASE_URL = 'http://localhost:3000';

// cheerioのモック - 実際の動作に近づける
jest.mock('cheerio', () => {
  const cheerio = {
    load: jest.fn((html) => {
      const $ = (selector) => {
        const result = {
          each: jest.fn((callback) => {
            if (selector === 'pre code') {
              // テスト用のダミーエレメント
              const element = {
                attribs: { class: 'language-javascript' },
                children: [{ data: "const test = 'hello';" }]
              };
              callback(0, element);
            }
          }),
          text: jest.fn(() => "const test = 'hello';"),
          attr: jest.fn((attribute) => {
            if (attribute === 'class') {
              return 'language-javascript';
            }
            return undefined;
          }),
          html: jest.fn((newHtml) => {
            // 新しいHTMLをセット
            if (newHtml !== undefined) {
              return result;
            }
            return "const test = 'hello';";
          }),
        };
        return result;
      };
      
      // $.html()メソッド
      $.html = jest.fn(() => html);
      
      return $;
    }),
  };
  
  return cheerio;
});


// Next.js Imageコンポーネントのモック
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority, ...props }) => {
    // priority属性はbooleanではなく文字列として扱う
    const imgProps = {
      ...props,
      ...(priority && { priority: priority.toString() })
    };
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...imgProps} />;
  },
}));

// Next.js navigationのモック
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
  notFound: jest.fn(),
}));