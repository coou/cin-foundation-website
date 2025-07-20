module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  plugins: [
    'html'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.min.js',
    'debug.html',
    'test-*.html'
  ]
};