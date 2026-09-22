export const SPLASH_STORAGE_PREFIX = 'splash_seen_'

export const getLocalDayKey = (now: Date = new Date()): string => {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export const getSplashSeenKey = (now: Date = new Date()): string =>
  `${SPLASH_STORAGE_PREFIX}${getLocalDayKey(now)}`

export const hasSeenSplashToday = (
  storage: Storage,
  now: Date = new Date(),
): boolean => storage.getItem(getSplashSeenKey(now)) !== null

export const markSplashSeen = (
  storage: Storage,
  now: Date = new Date(),
): void => {
  storage.setItem(getSplashSeenKey(now), 'true')
}
