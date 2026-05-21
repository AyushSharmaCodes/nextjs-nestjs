module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'node_modules/', 'dist/', 'coverage/'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'no-restricted-syntax': ['error', {
      selector: 'TSAsExpression > TSAnyKeyword',
      message: 'Do not use "as any". Use proper typing instead.',
    }],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],

    // ─── Module Boundary Enforcement ─────────────────────────────────────────
    // Prevents direct coupling between Auth and Communication modules.
    // These modules must ONLY communicate through the shared events contract.
    'no-restricted-imports': ['error',
      // Auth module must NOT import from Communication module
      {
        patterns: [
          {
            group: ['**/modules/communication/**'],
            importNames: [],
            message:
              '[COUPLING VIOLATION] Auth module must not import from CommunicationModule. ' +
              'Use shared events contract (src/shared/events/auth) instead.',
          },
        ],
      },
    ],
  },
  overrides: [
    // Apply stricter communication ↔ auth boundary rules per directory
    {
      files: ['src/modules/auth/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error',
          {
            patterns: [
              {
                group: ['**/modules/communication/**'],
                message:
                  '[COUPLING VIOLATION] Auth module must not import from CommunicationModule. ' +
                  'Emit via AuthEventEmitter → shared/events/auth instead.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/modules/communication/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error',
          {
            patterns: [
              {
                group: ['**/modules/auth/**'],
                message:
                  '[COUPLING VIOLATION] CommunicationModule must not import from AuthModule. ' +
                  'Listen via @OnEvent → shared/events/auth instead.',
              },
            ],
          },
        ],
      },
    },
  ],
};