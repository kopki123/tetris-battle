// import globals from 'globals';
// import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {files: ['**/*.{js,mjs,cjs,ts}']},
  // {languageOptions: { globals: globals.browser }},
  // pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      semi: 'error',
      quotes: ['error', 'single'],
      'prefer-const': 'error',
      'no-unused-vars': 'error',
      'linebreak-style': ['error', 'unix'],
    },
    ignores: ['./client/*']
  }
];