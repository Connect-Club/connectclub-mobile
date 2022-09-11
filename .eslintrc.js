module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:prettier/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'simple-import-sort',
    'prettier',
    'import',
    'react-hooks',
  ],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'simple-import-sort/imports': 'warn',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react-native/no-inline-styles': 'warn',
    'react/jsx-max-props-per-line': [
      1,
      {
        maximum: 1,
        when: 'multiline',
      },
    ],
  },
  overrides: [
    {
      files: ['./src/**/*.tsx', './src/**/*.ts'],
      rules: {
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              ['^\\u0000'],
              ['^@?\\w'],
              ['^[^.]'],
              ['src/api/api'],
              ['src/components'],
              ['src/helpers'],
              ['src/constants'],
              ['src/i118n'],
              ['src/models'],
              ['src/screens'],
              ['src/stores'],
              ['src/utils'],
              ['src/..'],
              ['icons/..'],
              ['^\\.'],
            ],
          },
        ],
      },
    },
  ],
}
