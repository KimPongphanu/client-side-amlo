import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // 🌟 ให้ Vite รับ Request จากทุก Network Interface
    port: 5173, // พอร์ตที่ต้องการ
    // 🌟 Docker dev (bind mount จาก Windows → Linux) ไม่ส่ง inotify events
    //    เปิด polling ผ่าน env VITE_USE_POLLING (ดู docker-compose.dev.yml) — dev บนเครื่องปกติไม่กระทบ
    watch: process.env.VITE_USE_POLLING
      ? { usePolling: true, interval: 500 }
      : undefined,
    // 🌟 /sitemap.xml ถูกสร้างจาก backend — proxy ไป backend ใน dev
    //    (ใน Docker dev ตั้ง VITE_SITEMAP_PROXY_TARGET=http://backend:8080)
    proxy: {
      '/sitemap.xml': {
        target:
          process.env.VITE_SITEMAP_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  // 🌟 เพิ่ม optimizeDeps เพื่อแก้ปัญหา Error: Calling 'require' for "react-is"
  optimizeDeps: {
    include: ['react-is'],
  },
})
