import { useState, useEffect } from 'react'

export interface TimerTheme {
  id: string
  name: string
  work: {
    primary: string
    secondary: string
    glow: string
    background: string
  }
  shortBreak: {
    primary: string
    secondary: string
    glow: string
    background: string
  }
  longBreak: {
    primary: string
    secondary: string
    glow: string
    background: string
  }
}

export interface ThemeSettings {
  selectedTheme: string
  customThemes: TimerTheme[]
}

const defaultThemes: TimerTheme[] = [
  {
    id: 'classic',
    name: 'Classic',
    work: {
      primary: '#ef4444',
      secondary: '#f97316',
      glow: 'rgba(239, 68, 68, 0.4)',
      background: 'rgba(239, 68, 68, 0.05)'
    },
    shortBreak: {
      primary: '#10b981',
      secondary: '#06d6a0',
      glow: 'rgba(16, 185, 129, 0.4)',
      background: 'rgba(16, 185, 129, 0.05)'
    },
    longBreak: {
      primary: '#8b5cf6',
      secondary: '#a855f7',
      glow: 'rgba(139, 92, 246, 0.4)',
      background: 'rgba(139, 92, 246, 0.05)'
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    work: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      glow: 'rgba(14, 165, 233, 0.4)',
      background: 'rgba(14, 165, 233, 0.05)'
    },
    shortBreak: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      glow: 'rgba(6, 182, 212, 0.4)',
      background: 'rgba(6, 182, 212, 0.05)'
    },
    longBreak: {
      primary: '#3b82f6',
      secondary: '#2563eb',
      glow: 'rgba(59, 130, 246, 0.4)',
      background: 'rgba(59, 130, 246, 0.05)'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    work: {
      primary: '#f59e0b',
      secondary: '#d97706',
      glow: 'rgba(245, 158, 11, 0.4)',
      background: 'rgba(245, 158, 11, 0.05)'
    },
    shortBreak: {
      primary: '#f97316',
      secondary: '#ea580c',
      glow: 'rgba(249, 115, 22, 0.4)',
      background: 'rgba(249, 115, 22, 0.05)'
    },
    longBreak: {
      primary: '#ec4899',
      secondary: '#db2777',
      glow: 'rgba(236, 72, 153, 0.4)',
      background: 'rgba(236, 72, 153, 0.05)'
    }
  },
  {
    id: 'forest',
    name: 'Forest Green',
    work: {
      primary: '#059669',
      secondary: '#047857',
      glow: 'rgba(5, 150, 105, 0.4)',
      background: 'rgba(5, 150, 105, 0.05)'
    },
    shortBreak: {
      primary: '#10b981',
      secondary: '#059669',
      glow: 'rgba(16, 185, 129, 0.4)',
      background: 'rgba(16, 185, 129, 0.05)'
    },
    longBreak: {
      primary: '#84cc16',
      secondary: '#65a30d',
      glow: 'rgba(132, 204, 22, 0.4)',
      background: 'rgba(132, 204, 22, 0.05)'
    }
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    work: {
      primary: '#6b7280',
      secondary: '#4b5563',
      glow: 'rgba(107, 114, 128, 0.4)',
      background: 'rgba(107, 114, 128, 0.05)'
    },
    shortBreak: {
      primary: '#9ca3af',
      secondary: '#6b7280',
      glow: 'rgba(156, 163, 175, 0.4)',
      background: 'rgba(156, 163, 175, 0.05)'
    },
    longBreak: {
      primary: '#374151',
      secondary: '#1f2937',
      glow: 'rgba(55, 65, 81, 0.4)',
      background: 'rgba(55, 65, 81, 0.05)'
    }
  },
  {
    id: 'neon',
    name: 'Neon',
    work: {
      primary: '#ff0080',
      secondary: '#ff4081',
      glow: 'rgba(255, 0, 128, 0.5)',
      background: 'rgba(255, 0, 128, 0.08)'
    },
    shortBreak: {
      primary: '#00ff80',
      secondary: '#40ff81',
      glow: 'rgba(0, 255, 128, 0.5)',
      background: 'rgba(0, 255, 128, 0.08)'
    },
    longBreak: {
      primary: '#8000ff',
      secondary: '#8140ff',
      glow: 'rgba(128, 0, 255, 0.5)',
      background: 'rgba(128, 0, 255, 0.08)'
    }
  }
]

export function useThemeSettings() {
  const [settings, setSettings] = useState<ThemeSettings>({
    selectedTheme: 'classic',
    customThemes: []
  })

  const [allThemes, setAllThemes] = useState<TimerTheme[]>(defaultThemes)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoro-theme-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
        
        // Merge custom themes with default themes
        if (parsed.customThemes) {
          setAllThemes(prev => [...prev, ...parsed.customThemes])
        }
      } catch (error) {
        console.error('Failed to parse theme settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-theme-settings', JSON.stringify(settings))
  }, [settings])

  const selectTheme = (themeId: string) => {
    setSettings(prev => ({ ...prev, selectedTheme: themeId }))
  }

  const addCustomTheme = (theme: TimerTheme) => {
    const newTheme = { ...theme, id: `custom-${Date.now()}` }
    
    setSettings(prev => ({
      ...prev,
      customThemes: [...prev.customThemes, newTheme]
    }))
    
    setAllThemes(prev => [...prev, newTheme])
    
    return newTheme.id
  }

  const updateCustomTheme = (themeId: string, theme: Partial<TimerTheme>) => {
    setSettings(prev => ({
      ...prev,
      customThemes: prev.customThemes.map(t => 
        t.id === themeId ? { ...t, ...theme } : t
      )
    }))
    
    setAllThemes(prev => prev.map(t => 
      t.id === themeId ? { ...t, ...theme } : t
    ))
  }

  const deleteCustomTheme = (themeId: string) => {
    setSettings(prev => ({
      ...prev,
      customThemes: prev.customThemes.filter(t => t.id !== themeId),
      selectedTheme: prev.selectedTheme === themeId ? 'classic' : prev.selectedTheme
    }))
    
    setAllThemes(prev => prev.filter(t => t.id !== themeId))
  }

  const getCurrentTheme = (): TimerTheme => {
    return allThemes.find(t => t.id === settings.selectedTheme) || defaultThemes[0]
  }

  const getThemeColors = (sessionType: 'work' | 'short_break' | 'long_break') => {
    const theme = getCurrentTheme()
    return theme[sessionType]
  }

  const resetToDefaults = () => {
    setSettings({
      selectedTheme: 'classic',
      customThemes: []
    })
    setAllThemes(defaultThemes)
  }

  const duplicateTheme = (themeId: string, newName: string) => {
    const themeToClone = allThemes.find(t => t.id === themeId)
    if (!themeToClone) return null

    const newTheme: TimerTheme = {
      ...themeToClone,
      id: `custom-${Date.now()}`,
      name: newName
    }

    return addCustomTheme(newTheme)
  }

  const isCustomTheme = (themeId: string): boolean => {
    return themeId.startsWith('custom-')
  }

  return {
    // State
    settings,
    allThemes,
    defaultThemes,
    currentTheme: getCurrentTheme(),
    
    // Actions
    selectTheme,
    addCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
    duplicateTheme,
    resetToDefaults,
    
    // Utilities
    getThemeColors,
    isCustomTheme,
  }
}

// Hook for using theme colors in components
export function useTimerTheme() {
  const { currentTheme, getThemeColors } = useThemeSettings()

  const getSessionTheme = (sessionType: 'work' | 'short_break' | 'long_break') => {
    const colors = getThemeColors(sessionType)
    
    return {
      gradient: {
        start: colors.primary,
        mid: colors.secondary,
        end: colors.primary
      },
      glow: colors.glow,
      background: colors.background,
      shadow: `shadow-[${colors.primary}]/20`
    }
  }

  return {
    currentTheme,
    getSessionTheme,
    getThemeColors
  }
}