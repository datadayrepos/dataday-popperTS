// @ts-check
import datadayrepos from '@datadayrepos/eslint-config'
import sortKeys from 'eslint-plugin-sort-keys'

export default datadayrepos(
  {
    typescript: true,
  },
  {
    ignores: [
      // eslint ignore globs paths here
    ],
  },
  {
    files: ['src/**/*.ts'],
    plugins: {
      'sort-keys': sortKeys,
    },
    rules: {
      'sort-keys/sort-keys-fix': 'error',
    },
  },
  {
    rules: {
      // overrides
      'node/prefer-global/process': 'off',
    },
  },
  {
    files: ['src/**/*.ts'],
    rules: {},
  },
)
