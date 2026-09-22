import DOMPurify from 'dompurify'

/**
 * Sanitize HTML ที่มาจากฐานข้อมูลก่อน render
 *
 * ตัด attribute `style` ออกด้วย เพราะ CSP ของเว็บใช้ `style-src 'self'`
 * (ไม่มี 'unsafe-inline') → ถ้าปล่อยไว้ เบราว์เซอร์จะบล็อกและขึ้น CSP violation
 * ผลที่ตามมา: สี/ขนาดตัวอักษรที่ฝังมากับบทความจาก editor จะไม่ถูกนำมาใช้
 * (ใช้ class เช่น ql-align-center ได้ตามปกติ)
 */
export const sanitizeHtml = (html: string): string =>
  DOMPurify.sanitize(html, { FORBID_ATTR: ['style'] })
