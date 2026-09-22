export const SPLASH_STORAGE_PREFIX = 'splash_seen_'

export type SplashOverride = 'force' | 'reset'

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

export const clearSplashSeen = (storage: Storage): number => {
  const keys: string[] = []

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index)
    if (key && key.startsWith(SPLASH_STORAGE_PREFIX)) keys.push(key)
  }

  keys.forEach((key) => storage.removeItem(key))
  return keys.length
}

export const parseSplashOverride = (
  search: string,
  enabled: boolean,
): SplashOverride | null => {
  if (!enabled) return null

  const value = new URLSearchParams(search).get('splash')
  return value === 'force' || value === 'reset' ? value : null
}
