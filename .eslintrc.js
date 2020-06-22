module.exports = {
  extends: ['airbnb-base', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'no-use-before-define': 'off',
    'max-classes-per-file': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_+$' }],
  },
  plugins: ['prettier'],
  env: {
    node: true,
    jest: true,
  },
};
