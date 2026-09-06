import { defineConfig } from 'vite-plus'

// WXT owns extension builds in wxt.config.ts; this config owns lint and format.
export default defineConfig({
  fmt: {
    semi: false,
    singleQuote: true,
  },
  lint: {
    plugins: ['react', 'typescript', 'unicorn'],
    env: {
      browser: true,
      node: true,
    },
    globals: {
      chrome: 'readonly',
    },
    categories: {
      correctness: 'error',
      suspicious: 'warn',
    },
    rules: {
      'eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'react/react-in-jsx-scope': 'off',
      'typescript/no-explicit-any': 'warn',
      'react/rules-of-hooks': 'error',
      'react/exhaustive-deps': 'warn',
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
    jsPlugins: [
      {
        name: 'vite-plus',
        specifier: 'vite-plus/oxlint-plugin',
      },
    ],
  },
})
