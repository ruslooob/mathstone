module.exports = {
  root: true,
  extends: ['airbnb', 'airbnb/hooks'],
  env: { browser: true, es2022: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'test-results/',
    'playwright-report/',
    '.agents/',
    '.sites-local/',
    '.openai/',
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'jsx-a11y/label-has-associated-control': ['error', { assert: 'htmlFor' }],
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      settings: { 'import/resolver': { typescript: true } },
      rules: {
        'import/extensions': ['error', 'ignorePackages', { ts: 'never', tsx: 'never' }],
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
        'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
        'react/prop-types': 'off',
        'react/require-default-props': 'off',
      },
    },
    {
      files: ['*.config.ts', '.eslintrc.cjs', 'checks/**/*.{js,ts}'],
      env: { node: true },
      rules: { 'import/no-extraneous-dependencies': ['error', { devDependencies: true }] },
    },
    {
      files: ['checks/**/*.js'],
      rules: {
        'import/extensions': ['error', 'ignorePackages', { js: 'always' }],
        // Browser actions share one page and must run in sequence.
        'no-await-in-loop': 'off',
        'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
      },
    },
  ],
};
