import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ThemeId, ColorMode, themes } from './index'

interface ThemeContextValue {
  themeId: ThemeId
  colorMode: ColorMode
  setThemeId: (t: ThemeId) => void
  setColorMode: (m: ColorMode) => void
  toggleColorMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyTheme(themeId: ThemeId, colorMode: ColorMode) {
  const tokens = themes[themeId][colorMode]
  const root = document.documentElement
  for (const [k, v] of Object.entries(tokens)) {
    root.style.setProperty(k, v)
  }
  if (colorMode === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>('airtel')
  const [colorMode, setColorModeState] = useState<ColorMode>('light')

  const setThemeId = (t: ThemeId) => {
    setThemeIdState(t)
    applyTheme(t, colorMode)
  }

  const setColorMode = (m: ColorMode) => {
    setColorModeState(m)
    applyTheme(themeId, m)
  }

  const toggleColorMode = () => setColorMode(colorMode === 'light' ? 'dark' : 'light')

  useEffect(() => {
    applyTheme(themeId, colorMode)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThemeContext.Provider value={{ themeId, colorMode, setThemeId, setColorMode, toggleColorMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
