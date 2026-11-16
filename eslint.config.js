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
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // 🌟 กฎนี้มาจาก React Compiler — flag ทุก useEffect ที่ fetch ข้อมูลตอน mount
      //    (setIsLoading(true) เรียก synchronously ใน effect body) ซึ่งเป็น pattern
      //    มาตรฐานของ React สำหรับ data fetching และทั้งโปรเจกต์ใช้อยู่
      //    ⚠️ ไม่ใช่ error เพราะไม่ใช่ bug — ปรับเป็น warning เพื่อให้เห็นและค่อยย้าย
      //    ไปใช้ data-fetching library ในอนาคต โดยไม่บล็อก CI
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
