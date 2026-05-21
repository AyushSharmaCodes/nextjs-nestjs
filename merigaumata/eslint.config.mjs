import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  {
    ignores: ["mocks/**/*", "mocks/**", "mocks"]
  },
  {
    extends: [...next],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/shared/icons/registry/index.ts"],
    rules: {
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
      "@typescript-eslint/no-explicit-any": ["error"],
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      "no-restricted-syntax": ["error", {
        selector: "TSAsExpression > TSAnyKeyword",
        message: "Do not use 'as any'. Use proper typing instead."
      }]
    }
  }
]);
