import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      "node_modules/**",
      "web-build/**",
      ".expo/**",
      "dist/**"
    ],
  },

  {
    files: ["babel.config.js", "jest.config.js"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "script",
      },
      globals: {
        module: "readonly",
      },
    },
  },

  {
    files: ["google-sheets-appscript.js"],
    languageOptions: {
      sourceType: "script",
      globals: {
        ContentService: "readonly",
        SpreadsheetApp: "readonly",
      },
    },
  },

  {
    files: ["tools/proxy/**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: {
        console: "readonly",
        process: "readonly",
        require: "readonly",
      },
    },
  },

  {
    files: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx"
    ],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        test: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly",
      },
    },
  },

  js.configs.recommended,

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,

      // TEMPORARY: reduce noise
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];