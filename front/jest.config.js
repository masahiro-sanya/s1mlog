const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // jsdom 環境では cheerio が browser 向け ESM に解決されて Jest が解釈できないため、CJS ビルドへ向ける
    '^cheerio$': '<rootDir>/node_modules/cheerio/dist/commonjs/index.js',
    // cheerio が fromURL 用に読み込む undici は jsdom で初期化できないためスタブ化（テストでは未使用）
    '^undici$': '<rootDir>/test/undici-stub.js',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'libs/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/out/**',
    '!**/coverage/**',
  ],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(test).[jt]s?(x)'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/out/', '/e2e/'],
};

// sanitize-html が引く htmlparser2 系は純 ESM（type:module・CJS ビルドなし）のため Jest の変換対象に
// 含める必要がある。next/jest は transformIgnorePatterns を「追記」してしまい元の node_modules 無視
// パターンが残るため、生成後に置換する（ネスト解決に備え sanitize-html 自身も許可、next 内部の
// 変換対象 geist / next/dist は維持）。それ以外の node_modules は従来どおり変換しない。
const TRANSFORM_IGNORE = [
  '/node_modules/(?!(geist|next/dist/client|next/dist/shared/lib|next/src/client|next/src/shared/lib|sanitize-html|htmlparser2|domhandler|domutils|dom-serializer|domelementtype|entities)/)',
  '^.+\\.module\\.(css|sass|scss)$',
];

// createJestConfig は next.config.js を非同期に読むため関数を返す。生成された設定を受けてから
// transformIgnorePatterns を上書きする。
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();
  config.transformIgnorePatterns = TRANSFORM_IGNORE;
  return config;
};
