import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Prevent console.log in production
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // Allow calling async functions (with useCallback) inside useEffect
      'react-hooks/set-state-in-effect': 'off',
      // Allow static components defined in outer scope (SortIcon pattern)
      'react-hooks/static-components': 'off',
      // Allow function-before-declaration pattern with useCallback
      'react-hooks/immutability': 'off',
      // Allow incompatible library hooks (react-hook-form watch)
      'react-hooks/incompatible-library': 'off',
      // Allow empty object type interfaces in UI components
      '@typescript-eslint/no-empty-object-type': 'off',
      // Context files export both Provider and hook — this is intentional
      'react-refresh/only-export-components': 'off',
    },
  },
])
