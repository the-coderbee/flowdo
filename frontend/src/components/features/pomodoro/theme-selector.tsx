"use client"

import { useState } from 'react'
import { Check, Palette, Copy, Trash2, Plus } from 'lucide-react'
import { useThemeSettings, TimerTheme } from '@/lib/hooks/use-theme-settings'

interface ThemeSelectorProps {
  className?: string
}

export function ThemeSelector({ className }: ThemeSelectorProps) {
  const {
    allThemes,
    settings,
    selectTheme,
    duplicateTheme,
    deleteCustomTheme,
    isCustomTheme
  } = useThemeSettings()

  const [showColorPicker, setShowColorPicker] = useState(false)

  const handleThemeSelect = (themeId: string) => {
    selectTheme(themeId)
  }

  const handleDuplicateTheme = (theme: TimerTheme) => {
    const newName = `${theme.name} Copy`
    duplicateTheme(theme.id, newName)
  }

  const handleDeleteTheme = (themeId: string) => {
    if (confirm('Are you sure you want to delete this custom theme?')) {
      deleteCustomTheme(themeId)
    }
  }

  const renderThemePreview = (theme: TimerTheme) => {
    return (
      <div className="flex space-x-1">
        {/* Work color */}
        <div 
          className="w-4 h-4 rounded-full border border-white/20"
          style={{ backgroundColor: theme.work.primary }}
        />
        {/* Short break color */}
        <div 
          className="w-4 h-4 rounded-full border border-white/20"
          style={{ backgroundColor: theme.shortBreak.primary }}
        />
        {/* Long break color */}
        <div 
          className="w-4 h-4 rounded-full border border-white/20"
          style={{ backgroundColor: theme.longBreak.primary }}
        />
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Palette className="w-5 h-5 text-white/80" />
        <h4 className="text-lg font-semibold text-white">Timer Themes</h4>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allThemes.map((theme) => (
          <div
            key={theme.id}
            className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
              settings.selectedTheme === theme.id
                ? 'bg-white/10 border-white/30 shadow-lg'
                : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
            }`}
            onClick={() => handleThemeSelect(theme.id)}
          >
            {/* Selected indicator */}
            {settings.selectedTheme === theme.id && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            {/* Theme info */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h5 className="font-semibold text-white text-sm">{theme.name}</h5>
                {isCustomTheme(theme.id) && (
                  <span className="text-xs text-white/50">Custom</span>
                )}
              </div>
              {renderThemePreview(theme)}
            </div>

            {/* Session previews */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: theme.work.primary }}
                />
                <span className="text-xs text-white/70">Work</span>
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: theme.shortBreak.primary }}
                />
                <span className="text-xs text-white/70">Short Break</span>
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: theme.longBreak.primary }}
                />
                <span className="text-xs text-white/70">Long Break</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-2 mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDuplicateTheme(theme)
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Duplicate theme"
              >
                <Copy className="w-3 h-3 text-white/60" />
              </button>
              
              {isCustomTheme(theme.id) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteTheme(theme.id)
                  }}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors"
                  title="Delete theme"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Create custom theme button */}
        <div
          className="p-4 rounded-xl border border-dashed border-white/30 hover:border-white/50 transition-colors cursor-pointer flex flex-col items-center justify-center text-white/60 hover:text-white/80 min-h-[140px]"
          onClick={() => setShowColorPicker(true)}
        >
          <Plus className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Create Custom</span>
        </div>
      </div>

      {/* Quick theme actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="text-xs text-white/50">
          {allThemes.length} theme{allThemes.length !== 1 ? 's' : ''} available
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowColorPicker(true)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3 h-3" />
            <span>Create Theme</span>
          </button>
        </div>
      </div>

      {/* Color picker modal (placeholder) */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl border border-white/20 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Create Custom Theme</h3>
            <p className="text-white/60 text-sm mb-4">
              Custom theme creation coming soon! For now, you can duplicate existing themes.
            </p>
            <button
              onClick={() => setShowColorPicker(false)}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeSelector