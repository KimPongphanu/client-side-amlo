// ประกาศ type ให้ import แบบ deep path ของ sweetalert2 (ตัวที่ "ไม่" inject <style> ตอน runtime)
// ตัวหลัก (sweetalert2) ชี้ไป dist/sweetalert2.all.js ซึ่ง inject CSS → ผิด CSP style-src 'self'
declare module 'sweetalert2/dist/sweetalert2.js' {
  import Swal from 'sweetalert2'
  export default Swal
}
