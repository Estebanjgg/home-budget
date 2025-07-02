'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  console.log('ThemeProvider render - theme:', theme, 'mounted:', mounted)

  useEffect(() => {
    console.log('ThemeProvider mounting...')
    setMounted(true)
    
    // Cargar tema guardado del localStorage
    const savedTheme = localStorage.getItem('theme') as Theme
    console.log('Saved theme from localStorage:', savedTheme)
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      console.log('Setting saved theme:', savedTheme)
      setTheme(savedTheme)
    } else {
      // Detectar preferencia del sistema
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      console.log('Setting system theme:', systemTheme)
      setTheme(systemTheme)
    }
  }, [])

  useEffect(() => {
    console.log('Theme effect triggered - theme:', theme, 'mounted:', mounted)
    if (mounted) {
      localStorage.setItem('theme', theme)
      console.log('Saved theme to localStorage:', theme)
      
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
        console.log('Added dark class to html')
      } else {
        document.documentElement.classList.remove('dark')
        console.log('Removed dark class from html')
      }
      
      console.log('Current html classes:', document.documentElement.className)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    console.log('toggleTheme called - current theme:', theme)
    const newTheme = theme === 'light' ? 'dark' : 'light'
    console.log('Setting new theme:', newTheme)
    setTheme(newTheme)
  }

  const contextValue = { theme, toggleTheme }
  console.log('ThemeContext value:', contextValue)

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  console.log('useTheme called - context:', context)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}