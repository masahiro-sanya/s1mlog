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
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(test).[jt]s?(x)',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/out/', '/e2e/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(cheerio|htmlparser2|domhandler|domutils|dom-serializer|entities|parse5|parse5-htmlparser2-tree-adapter|whatwg-url)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);