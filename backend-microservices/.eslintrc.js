module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'node_modules/', 'dist/', 'coverage/'],
  rules: {
    // ══════════════════════════════════════════════════════
    // GENERAL LINT RULES
    // ══════════════════════════════════════════════════════
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'no-console': 'error',

    // ══════════════════════════════════════════════════════
    // ARCHITECTURAL COUPLING BOUNDARY RULES (PRESERVED)
    // ══════════════════════════════════════════════════════
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['**/modules/communication/**'],
          message:
            '[COUPLING VIOLATION] Auth module must not import from CommunicationModule. ' +
            'Use shared events contract (src/shared/events/auth) instead.',
        },
      ],
    }],

    // ══════════════════════════════════════════════════════
    // ERRORS — break the build immediately
    // ══════════════════════════════════════════════════════

    // The cardinal rule — no `any` at all
    '@typescript-eslint/no-explicit-any':               'error',

    // Forbid assigning values typed as `any`
    '@typescript-eslint/no-unsafe-assignment':           'error',

    // Forbid calling values typed as `any`
    '@typescript-eslint/no-unsafe-call':                 'error',

    // Forbid accessing members of values typed as `any`
    '@typescript-eslint/no-unsafe-member-access':        'error',

    // Forbid returning `any` from a typed function
    '@typescript-eslint/no-unsafe-return':               'error',

    // Forbid spreading `any` typed values
    '@typescript-eslint/no-unsafe-argument':             'error',

    // Every exported function/method must declare its return type
    '@typescript-eslint/explicit-module-boundary-types': 'error',

    // Every function must have an explicit return type annotation
    '@typescript-eslint/explicit-function-return-type':  ['error', {
      allowExpressions:                          false,
      allowTypedFunctionExpressions:             true,
      allowHigherOrderFunctions:                 false,
      allowDirectConstAssertionInArrowFunctions: true,
    }],

    // Promises must be awaited or explicitly void-cast
    '@typescript-eslint/no-floating-promises':           'error',

    // Forbid misused promises (e.g. if (asyncFn()) {...})
    '@typescript-eslint/no-misused-promises':            'error',

    // No type assertions that don't change anything
    '@typescript-eslint/no-unnecessary-type-assertion':  'error',

    // No unnecessary generic type parameters
    '@typescript-eslint/no-unnecessary-type-parameters': 'error',

    // Type parameters must constrain something
    '@typescript-eslint/no-unnecessary-type-constraint': 'error',

    // Ban ALL `as X` casts — use type annotations or satisfies instead
    '@typescript-eslint/consistent-type-assertions':     ['error', {
      assertionStyle:              'never',
      objectLiteralTypeAssertions: 'never',
    }],

    // @ts-ignore is fully banned; @ts-expect-error needs a description
    '@typescript-eslint/ban-ts-comment': ['error', {
      'ts-expect-error': 'allow-with-description',
      'ts-ignore':       true,
      'ts-nocheck':      true,
      'ts-check':        false,
      minimumDescriptionLength: 10,
    }],

    // Forbid non-null assertions (value!)
    '@typescript-eslint/no-non-null-assertion':                 'error',

    // Forbid non-null on optional chain results (value?.prop!)
    '@typescript-eslint/no-non-null-asserted-optional-chain':   'error',

    // Forbid nullish coalescing on values that are never null/undefined
    '@typescript-eslint/no-unnecessary-condition':               'error',

    // override keyword required on overriding members
    '@typescript-eslint/explicit-override': 'error',

    // Type-only imports must use `import type`
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer:                  'type-imports',
      fixStyle:                'separate-type-imports',
      disallowTypeAnnotations: true,
    }],

    // Type-only exports must use `export type`
    '@typescript-eslint/consistent-type-exports': ['error', {
      fixMixedExportsWithInlineTypeSpecifier: false,
    }],

    // No direct process.env access outside the config file
    'no-restricted-syntax': ['error', {
      selector: "MemberExpression[object.name='process'][property.name='env']",
      message:
        "Direct process.env access is forbidden. " +
        "Import from config/env.config.ts (NestJS) or config/env.ts (Next.js).",
    }],

    // Unused variables rules for NestJS constructor DI parameters
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      args:              'after-used',
      caughtErrors:              'all',
      caughtErrorsIgnorePattern: '^_',
    }],

    // Catch callbacks must use unknown
    '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',

    // Enum comparisons must be type-safe
    '@typescript-eslint/no-unsafe-enum-comparison': 'error',

    // No CommonJS require()
    '@typescript-eslint/no-require-imports': 'error',

    // ══════════════════════════════════════════════════════
    // WARNINGS — visible in editor, fatal in CI (--max-warnings 0)
    // ══════════════════════════════════════════════════════

    // Prefer ?? over || for default values
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',

    // Prefer ?. over && chains
    '@typescript-eslint/prefer-optional-chain': 'warn',

    // Prefer `as const` over literal type annotations
    '@typescript-eslint/prefer-as-const': 'warn',

    // Prefer readonly on properties never reassigned
    '@typescript-eslint/prefer-readonly': 'warn',

    // Require explicit access modifiers on class members (exempting parameter properties and constructors)
    '@typescript-eslint/explicit-member-accessibility': ['error', {
      accessibility: 'explicit',
      overrides: {
        constructors:        'off',
        parameterProperties: 'off',
      },
    }],

    // Import ordering
    'import/order': ['warn', {
      groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
    }],
    'import/no-duplicates':             'warn',
    'import/no-cycle':                  'warn',
    'import/no-self-import':            'error',
    'import/no-useless-path-segments':  'warn',
  },

  overrides: [
    // Relax rules in test files
    {
      files: ['**/*.spec.ts', '**/*.test.ts', '**/*.e2e-spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any':               'off',
        '@typescript-eslint/no-unsafe-assignment':           'off',
        '@typescript-eslint/explicit-function-return-type':  'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
    // Allow process.env in config files only
    {
      files: ['**/config/env*.ts', '**/config/env*.config.ts'],
      rules: { 'no-restricted-syntax': 'off' },
    },
    // Directory boundary rules for auth
    {
      files: ['src/modules/auth/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [
            {
              group: ['**/modules/communication/**'],
              message:
                '[COUPLING VIOLATION] Auth module must not import from CommunicationModule. ' +
                'Emit via AuthEventEmitter → shared/events/auth instead.',
            },
          ],
        }],
      },
    },
    // Directory boundary rules for communication
    {
      files: ['src/modules/communication/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [
            {
              group: ['**/modules/auth/**'],
              message:
                '[COUPLING VIOLATION] CommunicationModule must not import from AuthModule. ' +
                'Listen via @OnEvent → shared/events/auth instead.',
            },
          ],
        }],
      },
    },
  ],
};