module.exports = {
  extends: ['airbnb-base', 'prettier'],
  rules: {
    'no-var': 'off',
    'vars-on-top': 'off',
    'func-names': 'off',
    'prettier/prettier': 'error',
    'no-use-before-define': 'off'
  },
  plugins: ['prettier'],
  env: {
    browser: true,
    node: true,
    jest: true
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          // If not a child of src, add parent folder to NODE_PATH env
          ['utils', './src/utils'],
          ['shared', './src/shared'],
          ['src', './src'],
          ['test', './test/utils'],
        ],
        extensions: ['.js']
      },
      node: {
        extensions: ['.js']
      }
    }
  },
}
