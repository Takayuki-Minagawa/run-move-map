module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
    node: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script',
  },
  globals: {
    // グローバル変数として定義（他のスクリプトで定義）
    ROUTE_DATA: 'readonly',
    getLocationByDistance: 'readonly',
    getNewlyReachedCities: 'readonly',
    Storage: 'readonly',
    Achievements: 'readonly',
    BADGES: 'readonly',
    LEVELS: 'readonly',
    JapanMap: 'readonly',
    App: 'readonly',
  },
  rules: {
    // エラー
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',

    // 警告
    'no-console': 'warn',
    'prefer-const': 'warn',

    // スタイル（CIでは警告のみ）
    'semi': ['warn', 'always'],
    'quotes': ['off'],
    'indent': ['off'],
    'comma-dangle': ['off'],
    'no-trailing-spaces': ['off'],
    'eol-last': ['off'],
  },
};
