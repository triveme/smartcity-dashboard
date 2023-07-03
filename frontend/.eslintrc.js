module.exports = {
  extends: ['react-app', 'react-app/jest', 'plugin:prettier/recommended'],
  rules: {
    'import/no-anonymous-default-export': ['error', { allowArrowFunction: true, allowObject: true, allowArray: true }],
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'react/jsx-closing-bracket-location': [1, { nonEmpty: 'tag-aligned', selfClosing: 'line-aligned' }],
    'react/jsx-closing-tag-location': 1,
  },
  parserOptions: {
    babelOptions: {
      presets: [['babel-preset-react-app', false], 'babel-preset-react-app/prod'],
    },
  },
}
