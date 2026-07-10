import ReactGA from 'react-ga4'

export const initGA = (): void => {
  // ดึงค่าจาก .env
  const trackingId = import.meta.env.VITE_GA_MEASUREMENT_ID

  if (import.meta.env.PROD && trackingId) {
    ReactGA.initialize(trackingId)
  } else {
    // Development fallback
  }
}

export const logPageView = (path: string): void => {
  if (import.meta.env.PROD) {
    ReactGA.send({ hitType: 'pageview', page: path })
  } else {
    // Development fallback
  }
}
