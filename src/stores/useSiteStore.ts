import { create } from 'zustand'

type FontSize = 'small' | 'medium' | 'large'
type Language = 'th' | 'en'
type Theme = 'normal' | 'grayscale' | 'high-contrast'

interface SiteState {
  fontSize: FontSize
  language: Language
  theme: Theme
  setFontSize: (size: FontSize) => void
  setLanguage: (lang: Language) => void
  setTheme: (theme: Theme) => void
}

const getInitialFontSize = (): FontSize => {
  const saved = localStorage.getItem('amlo_font_size') as FontSize | null
  return saved || 'medium'
}

const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem('amlo_language') as Language | null
  return saved || 'th'
}

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('amlo_theme') as Theme | null
  return saved || 'normal'
}

export const useSiteStore = create<SiteState>((set) => ({
  fontSize: getInitialFontSize(),
  language: getInitialLanguage(),
  theme: getInitialTheme(),
  setFontSize: (size) => {
    localStorage.setItem('amlo_font_size', size)
    set({ fontSize: size })
  },
  setLanguage: (lang) => {
    localStorage.setItem('amlo_language', lang)
    set({ language: lang })
  },
  setTheme: (theme) => {
    localStorage.setItem('amlo_theme', theme)
    set({ theme })
  },
}))
