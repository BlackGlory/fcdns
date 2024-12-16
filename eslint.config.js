// @ts-check

import js from '@eslint/js'
import ts from 'typescript-eslint'

export default ts.config(
  js.configs.recommended
, ...ts.configs.recommended
, {
    rules: {
      'no-useless-escape': 'off'
    , '@typescript-eslint/no-duplicate-enum-values': 'off'
    }
  }
)
