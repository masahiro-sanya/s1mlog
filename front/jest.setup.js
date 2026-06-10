// jest.setup.js
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'node:util';

// jsdom には TextEncoder/TextDecoder がなく、cheerio（経由の undici）が必要とするため補う
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder;
}

// Mock環境変数
process.env.MICROCMS_SERVICE_DOMAIN = 'test-domain';
process.env.MICROCMS_API_KEY = 'test-api-key';
process.env.BASE_URL = 'http://localhost:3000';

// Next.js Imageコンポーネントのモック
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority, ...props }) => {
    // priority属性はbooleanではなく文字列として扱う
    const imgProps = {
      ...props,
      ...(priority && { priority: priority.toString() }),
    };
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
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
