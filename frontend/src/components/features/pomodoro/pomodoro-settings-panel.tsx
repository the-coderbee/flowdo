import { PomodoroSettings } from '@/lib/hooks/use-pomodoro-timer'

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
  const handleSettingChange = (key: keyof PomodoroSettings, value: number) => {
    onUpdateSettings({
      ...settings,
      [key]: value
    })
  }

  return (
    <div className={`bg-gray-900 p-6 rounded-lg border border-gray-700 w-full max-w-md ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Timer Settings</h3>
      
      <div className="space-y-4">
        {/* Work Duration */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Work Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={settings.workDuration}
            onChange={(e) => handleSettingChange('workDuration', parseInt(e.target.value))}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Short Break Duration */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Short Break (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={settings.shortBreakDuration}
            onChange={(e) => handleSettingChange('shortBreakDuration', parseInt(e.target.value))}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Long Break Duration */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Long Break (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={settings.longBreakDuration}
            onChange={(e) => handleSettingChange('longBreakDuration', parseInt(e.target.value))}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Sessions Until Long Break */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Sessions until Long Break
          </label>
          <input
            type="number"
            min="2"
            max="10"
            value={settings.sessionsUntilLongBreak}
            onChange={(e) => handleSettingChange('sessionsUntilLongBreak', parseInt(e.target.value))}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <button
        onClick={onClose}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
      >
        Save Settings
      </button>
    </div>
  )
}

export default PomodoroSettingsPanel