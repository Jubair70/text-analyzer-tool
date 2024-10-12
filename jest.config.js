module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts', '**/*.integration-spec.ts', '**/*.e2e-spec.ts'],
  collectCoverage: true,
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
