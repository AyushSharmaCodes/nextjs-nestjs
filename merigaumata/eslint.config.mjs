import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import importPlugin from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  {
    ignores: [
      "mocks/**/*",
      "mocks/**",
      "mocks",
      ".next/**/*",
      "node_modules/**/*",
      "dist/**/*",
      "build/**/*"
    ]
  },
  {
    extends: [...next],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/shared/icons/registry/index.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "import": importPlugin,
    },
    rules: {
      // ══════════════════════════════════════════════════════
      // EXISTING CUSTOM RULES (PRESERVED)
      // ══════════════════════════════════════════════════════
      "no-restricted-imports": [
        "warn",
        {
          paths: [
            {
              name: "lucide-react",
              message: "Please import icons from '@/shared/icons' instead of importing directly from 'lucide-react' to adhere to our centralized Icon System."
            }
          ]
        }
      ],
      "no-console": "error",

      // ══════════════════════════════════════════════════════
      // ERRORS — break the build immediately
      // ══════════════════════════════════════════════════════

      // The cardinal rule — no `any` at all
      "@typescript-eslint/no-explicit-any":               "error",

      // Forbid assigning values typed as `any`
      "@typescript-eslint/no-unsafe-assignment":           "error",

      // Forbid calling values typed as `any`
      "@typescript-eslint/no-unsafe-call":                 "error",

      // Forbid accessing members of values typed as `any`
      "@typescript-eslint/no-unsafe-member-access":        "error",

      // Forbid returning `any` from a typed function
      "@typescript-eslint/no-unsafe-return":               "error",

      // Forbid spreading `any` typed values
      "@typescript-eslint/no-unsafe-argument":             "error",

      // Every exported function/method must declare its return type
      "@typescript-eslint/explicit-module-boundary-types": "error",

      // Every function must have an explicit return type annotation (relaxed slightly for Next.js arrow component expressions)
      "@typescript-eslint/explicit-function-return-type":  ["error", {
        allowExpressions:                          true,
        allowTypedFunctionExpressions:             true,
        allowHigherOrderFunctions:                 false,
        allowDirectConstAssertionInArrowFunctions: true,
      }],

      // Promises must be awaited or explicitly void-cast
      "@typescript-eslint/no-floating-promises":           "error",

      // Forbid misused promises (e.g. if (asyncFn()) {...})
      "@typescript-eslint/no-misused-promises":            "error",

      // No type assertions that don't change anything
      "@typescript-eslint/no-unnecessary-type-assertion":  "error",

      // No unnecessary generic type parameters
      "@typescript-eslint/no-unnecessary-type-parameters": "error",

      // Type parameters must constrain something
      "@typescript-eslint/no-unnecessary-type-constraint": "error",

      // Ban ALL `as X` casts — use type annotations or satisfies instead
      "@typescript-eslint/consistent-type-assertions":     ["error", {
        assertionStyle:              "never",
        objectLiteralTypeAssertions: "never",
      }],

      // @ts-ignore is fully banned; @ts-expect-error needs a description
      "@typescript-eslint/ban-ts-comment": ["error", {
        "ts-expect-error": "allow-with-description",
        "ts-ignore":       true,
        "ts-nocheck":      true,
        "ts-check":        false,
        minimumDescriptionLength: 10,
      }],

      // Forbid non-null assertions (value!)
      "@typescript-eslint/no-non-null-assertion":                 "error",

      // Forbid non-null on optional chain results (value?.prop!)
      "@typescript-eslint/no-non-null-asserted-optional-chain":   "error",

      // Forbid nullish coalescing on values that are never null/undefined
      "@typescript-eslint/no-unnecessary-condition":               "error",

      // override keyword required on overriding members
      "@typescript-eslint/explicit-override": "error",

      // Type-only imports must use `import type`
      "@typescript-eslint/consistent-type-imports": ["error", {
        prefer:                  "type-imports",
        fixStyle:                "separate-type-imports",
        disallowTypeAnnotations: true,
      }],

      // Type-only exports must use `export type`
      "@typescript-eslint/consistent-type-exports": ["error", {
        fixMixedExportsWithInlineTypeSpecifier: false,
      }],

      // No direct process.env access outside the config file
      "no-restricted-syntax": ["error",
        {
          selector: "TSAsExpression > TSAnyKeyword",
          message: "Do not use 'as any'. Use proper typing instead."
        },
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: "Direct process.env access is forbidden. Import from config/env.ts (Next.js)."
        }
      ],

      // Unused variables must be prefixed with _ to be intentionally ignored
      "@typescript-eslint/no-unused-vars": ["error", {
        vars:                      "all",
        args:                      "all",
        argsIgnorePattern:         "^_",
        varsIgnorePattern:         "^_",
        caughtErrors:              "all",
        caughtErrorsIgnorePattern: "^_",
      }],

      // Catch callbacks must use unknown
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",

      // Enum comparisons must be type-safe
      "@typescript-eslint/no-unsafe-enum-comparison": "error",

      // No CommonJS require()
      "@typescript-eslint/no-require-imports": "error",

      // ══════════════════════════════════════════════════════
      // WARNINGS — visible in editor, fatal in CI (--max-warnings 0)
      // ══════════════════════════════════════════════════════

      // Prefer ?? over || for default values
      "@typescript-eslint/prefer-nullish-coalescing": "warn",

      // Prefer ?. over && chains
      "@typescript-eslint/prefer-optional-chain": "warn",

      // Prefer `as const` over literal type annotations
      "@typescript-eslint/prefer-as-const": "warn",

      // Prefer readonly on properties never reassigned
      "@typescript-eslint/prefer-readonly": "warn",

      // Require explicit access modifiers on class members
      "@typescript-eslint/explicit-member-accessibility": ["warn", {
        accessibility: "explicit",
        overrides: { constructors: "off" },
      }],

      // Import ordering
      "import/order": ["warn", {
        groups: ["builtin", "external", "internal", ["parent", "sibling", "index"], "type"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      }],
      "import/no-duplicates":             "warn",
      "import/no-cycle":                  "warn",
      "import/no-self-import":            "error",
      "import/no-useless-path-segments":  "warn",
    }
  }
]);
