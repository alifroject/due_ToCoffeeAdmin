import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// For Firebase Functions, we use the standard recommended configs
// rather than Next.js specific ones
const eslintConfig = [
  js.configs.recommended,
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ),
  {
    files: ["**/*.ts", "**/*.js"],
    ignores: ["node_modules/**", "lib/**", "dist/**"],
    rules: {
      // Add any custom rules for your Firebase Functions here
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
    }
  }
];

export default eslintConfig;