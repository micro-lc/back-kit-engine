/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  rootDir: './src',
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: '../coverage',
  coverageReporters: ['cobertura', 'lcov', 'text'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/index.ts',
    '!<rootDir>/bin/**/*.ts',
    '!<rootDir>/schemas/**/*.ts',
    '!<rootDir>/utils/docs/**/*.ts',
    '!<rootDir>/events/bk/**/*.ts'
  ],
  coverageThreshold: {global: {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100
  }},
  moduleNameMapper: {'^rxjs': ['rxjs']},
  testEnvironment: 'jsdom',
  transform: {'^.+\\.[jt]sx?$': [
    'esbuild-jest',
    {
      sourcemap: true,
      loaders: {'.test.ts': 'tsx'}
    }
  ]},
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$',
  transformIgnorePatterns: [
    '../node_modules/(?!(@open-wc|@lit|lit|lit-html|lit-element|@esm-build|uuid)/)'
  ],
  setupFilesAfterEnv: [
    './testSetup.ts'
  ]
}
