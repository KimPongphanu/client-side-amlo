import ReactGA from 'react-ga4'

export const initGA = (): void => {
  // ดึงค่าจาก .env
  const trackingId = import.meta.env.VITE_GA_MEASUREMENT_ID

  if (import.meta.env.PROD && trackingId) {
    // react-ga4 injects gtag.js from https://www.googletagmanager.com
    ReactGA.initialize(trackingId)
  } else {
    // Development fallback — ทำงานแบบเงียบ (ไม่ส่งข้อมูล)
  }
}

export const logPageView = (path: string): void => {
  if (import.meta.env.PROD) {
    ReactGA.send({ hitType: 'pageview', page: path })
  } else {
    // Development fallback
  }
}
