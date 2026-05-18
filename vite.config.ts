import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 🌟 เพิ่ม optimizeDeps เพื่อแก้ปัญหา Error: Calling 'require' for "react-is"
  optimizeDeps: {
    include: ['react-google-recaptcha', 'react-is']
  }
})