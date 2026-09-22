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
  },

  // 🌟 เพิ่ม optimizeDeps เพื่อแก้ปัญหา Error: Calling 'require' for "react-is"
  optimizeDeps: {
    include: ['react-is'],
  },
})
