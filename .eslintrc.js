module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],

  plugins: [
    'import',
    '@typescript-eslint',
    'eslint-plugin-import-helpers',
    'jest',
  ],

  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
    typescript: {
      directory: './',
    },
  },

  rules: {
    'arrow-parens': ['error', 'as-needed', { "requireForBlockBody": true }],
    'curly': ['error', 'all'],
    'class-methods-use-this': 'off',
    'linebreak-style': ["error", "unix"],
    'no-case-declarations': 'off',
    'no-underscore-dangle': 'off',
    'no-dupe-class-members': 'off',
    'no-empty': 'off',
    'no-return-assign': 'off',
    'no-continue': 'off',
    'no-shadow': 'off',
    'no-restricted-syntax': 'off',
    'no-undef': 'off',
    'no-plusplus': 'off',
    'no-param-reassign': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-globals': 'off',
    'no-useless-constructor': 'off',
    'max-classes-per-file': 'off',
    'max-len': [
      "error",
      {
        code: 120,
        ignoreTrailingComments: true,
        ignoreStrings: true
      }
    ],
    'lines-between-class-members': 'off',
    'require-atomic-updates': 'off',
    'default-case': 'off',
    'prefer-destructuring': 'off',
    'consistent-return': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/named': 'off',
    'import/export': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'warn',
    'import/prefer-default-export': 'off',
    'import/no-cycle': 'off',
    'import-helpers/order-imports': [
      'warn',
      {
        newlinesBetween: 'always',
        groups: ['module', '/^@/', '/^~/', ['parent', 'sibling', 'index']],
        alphabetize: { order: 'asc', ignoreCase: true },
      },
    ],
    'prefer-arrow-callback': [
      'error',
      {
        'allowNamedFunctions': true
      }
    ]
  },

  env: {
    'jest/globals': true,
  },
}
