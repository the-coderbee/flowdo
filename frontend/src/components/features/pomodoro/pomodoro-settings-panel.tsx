import { PomodoroSettings } from '@/lib/hooks/use-pomodoro-timer'
import { X, Clock, Coffee, Moon, Repeat, Check, Palette } from 'lucide-react'
import { useState } from 'react'
import { ThemeSelector } from './theme-selector'

interface PomodoroSettingsPanelProps {
  settings: PomodoroSettings
  onUpdateSettings: (settings: PomodoroSettings) => void
  onClose: () => void
  className?: string
}

export function PomodoroSettingsPanel({
  settings,
  onUpdateSettings,
  onClose,
  className
}: PomodoroSettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<'timer' | 'theme'>('timer')

  const handleSettingChange = (key: keyof PomodoroSettings, value: number) => {
    const newSettings = {
      ...localSettings,
      [key]: value
    }
    setLocalSettings(newSettings)
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(settings))
  }

  const handleSave = () => {
    onUpdateSettings(localSettings)
    setHasChanges(false)
    onClose()
  }

  const handleReset = () => {
    setLocalSettings(settings)
    setHasChanges(false)
  }

  const presets = [
    { name: 'Classic', work: 25, short: 5, long: 15, sessions: 4 },
    { name: 'Extended', work: 45, short: 10, long: 30, sessions: 3 },
    { name: 'Short Burst', work: 15, short: 3, long: 10, sessions: 6 },
    { name: 'Deep Work', work: 90, short: 20, long: 45, sessions: 2 }
  ]

  const applyPreset = (preset: typeof presets[0]) => {
    const newSettings = {
      workDuration: preset.work,
      shortBreakDuration: preset.short,
      longBreakDuration: preset.long,
      sessionsUntilLongBreak: preset.sessions
    }
    setLocalSettings(newSettings)
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(settings))
  }

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
            {activeTab === 'timer' ? (
              <>
                <Clock className="w-6 h-6 text-blue-400" />
                <span>Timer Settings</span>
              </>
            ) : (
              <>
                <Palette className="w-6 h-6 text-purple-400" />
                <span>Theme Settings</span>
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'timer'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Timer</span>
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'theme'
                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Themes</span>
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto">
          {activeTab === 'timer' ? (
            <>
              {/* Presets */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Quick Presets</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {presets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => applyPreset(preset)}
                      className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 hover:scale-105 text-left"
                    >
                      <div className="font-semibold text-white text-sm mb-1">{preset.name}</div>
                      <div className="text-xs text-white/60">
                        {preset.work}m / {preset.short}m / {preset.long}m
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Settings */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Custom Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Work Duration */}
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 text-sm font-medium text-white/80">
                      <Clock className="w-4 h-4 text-red-400" />
                      <span>Work Duration</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={localSettings.workDuration}
                        onChange={(e) => handleSettingChange('workDuration', parseInt(e.target.value) || 1)}
                        className="w-full p-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white placeholder-white/40 text-lg font-mono"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm">
                        min
                      </span>
                    </div>
                  </div>

                  {/* Short Break Duration */}
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 text-sm font-medium text-white/80">
                      <Coffee className="w-4 h-4 text-green-400" />
                      <span>Short Break</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={localSettings.shortBreakDuration}
                        onChange={(e) => handleSettingChange('shortBreakDuration', parseInt(e.target.value) || 1)}
                        className="w-full p-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-white placeholder-white/40 text-lg font-mono"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm">
                        min
                      </span>
                    </div>
                  </div>

                  {/* Long Break Duration */}
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 text-sm font-medium text-white/80">
                      <Moon className="w-4 h-4 text-purple-400" />
                      <span>Long Break</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={localSettings.longBreakDuration}
                        onChange={(e) => handleSettingChange('longBreakDuration', parseInt(e.target.value) || 1)}
                        className="w-full p-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-white/40 text-lg font-mono"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm">
                        min
                      </span>
                    </div>
                  </div>

                  {/* Sessions Until Long Break */}
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 text-sm font-medium text-white/80">
                      <Repeat className="w-4 h-4 text-blue-400" />
                      <span>Sessions Until Long Break</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="2"
                        max="10"
                        value={localSettings.sessionsUntilLongBreak}
                        onChange={(e) => handleSettingChange('sessionsUntilLongBreak', parseInt(e.target.value) || 2)}
                        className="w-full p-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-white/40 text-lg font-mono"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm">
                        sessions
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Theme Settings */
            <ThemeSelector />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="px-4 py-2 text-white/60 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Reset Changes
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PomodoroSettingsPanel