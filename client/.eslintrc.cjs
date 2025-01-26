// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
  ],
  ignorePatterns: ['*.d.ts'],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: [
    'vue',
  ],
  rules: {
    '@typescript-eslint/no-unused-expressions': 'off',
    'no-console': 'off',
    'linebreak-style': [
      'error',
      'unix',
    ],
    quotes: [
      'error',
      'single',
    ],
    semi: [
      'error',
      'always',
    ],
    'vuejs-accessibility/click-events-have-key-events': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never',
      multiline: 'always',
    }],
    'vue/valid-v-on': ['off', {
      modifiers: [],
    }],
    'vuejs-accessibility/form-control-has-label': [
      'off',
      {
        labelComponents: ['CustomLabel'],
        controlComponents: ['CustomInput'],
      },
    ],
    'import/no-extraneous-dependencies': 'off',
    '@typescript-eslint/type-annotation-spacing': 'error',
    'space-before-function-paren': 'off',
    '@typescript-eslint/space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'always',
      asyncArrow: 'always',
    }],
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
      disallowTypeAnnotations: true,
      fixStyle: 'separate-type-imports',
    }],
  },
};
