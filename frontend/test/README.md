# Directory Structure

```
test/
├── README.md          # This file - test documentation
├── setup.ts           # Global test setup and configuration
├── utils/             # Test utilities and helpers
├── mocks/             # Global mocks and fixtures
├── unit/              # Unit test files
├── integration/       # Integration test files
└── e2e/               # End-to-end test files

src/
├── components/
│   └── ComponentName/
│       ├── index.tsx
│       └── __tests__/
│           └── ComponentName.test.tsx
├── pages/
│   └── PageName/
│       ├── index.tsx
│       └── __tests__/
│           └── PageName.test.tsx
└── __tests__/         # Tests for src root level files
    └── authProvider.test.ts
```
