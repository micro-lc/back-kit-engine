/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  rootDir: './src',
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: '../coverage/bke',
  coverageReporters: ['cobertura', 'text', 'lcov'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/index.ts',
    '!<rootDir>/bin/**/*.ts',
    '!<rootDir>/schemas/**/*.ts',
    '!<rootDir>/utils/docs/**/*.ts',
    '!<rootDir>/events/bk/**/*.ts',
    '!<rootDir>/west/**/*.ts',
    '!<rootDir>/docgen/components.ts',
    '!<rootDir>/docgen/events.ts'
  ],
  coverageThreshold: {global: {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }},
  moduleNameMapper: {
    '^rxjs': ['rxjs']
  },
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
