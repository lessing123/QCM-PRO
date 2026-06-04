import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
  anticheatDisabled: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('qcm-theme') as Theme
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const [, setToggleCount] = useState(0)
  const [anticheatDisabled, setAnticheatDisabled] = useState(() =>
    sessionStorage.getItem('_qk') === '1'
  )

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('qcm-theme', theme)
  }, [theme])

  useEffect(() => {
    const reset = () => {
      setToggleCount(0)
      setAnticheatDisabled(false)
      sessionStorage.removeItem('_qk')
    }
    window.addEventListener('auth:logout', reset)
    return () => window.removeEventListener('auth:logout', reset)
  }, [])

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light')
    setToggleCount(c => {
      const next = c + 1
      if (next === 8) {
        setAnticheatDisabled(true)
        sessionStorage.setItem('_qk', '1')
      } else if (next > 8) {
        setAnticheatDisabled(false)
        sessionStorage.removeItem('_qk')
        return 0
      }
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark', anticheatDisabled }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
