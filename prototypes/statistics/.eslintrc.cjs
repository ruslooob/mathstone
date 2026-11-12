module.exports = {
  overrides: [
    {
      files: ['tests/**/*.ts'],
      env: { node: true },
      rules: { 'import/no-extraneous-dependencies': ['error', { devDependencies: true }] },
    },
  ],
};
