import { useEffect, useRef, useState, useCallback } from 'react'

export interface NotificationSettings {
  sound: boolean
  browser: boolean
  volume: number
  soundType: 'chime' | 'bell' | 'digital' | 'nature'
}

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [settings, setSettings] = useState<NotificationSettings>({
    sound: true,
    browser: true,
    volume: 0.7,
    soundType: 'chime'
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize notification permission and audio
  useEffect(() => {
    // Check initial permission
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('pomodoro-notification-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to parse notification settings:', error)
      }
    }

    // Create audio element
    audioRef.current = new Audio()
    audioRef.current.preload = 'auto'

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-notification-settings', JSON.stringify(settings))
  }, [settings])

  // Update audio source when sound type changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = getSoundPath(settings.soundType)
      audioRef.current.volume = settings.volume
    }
  }, [settings.soundType, settings.volume])

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      setPermission('granted')
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      setPermission('denied')
      return 'denied'
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      setPermission('denied')
      return 'denied'
    }
  }, [])

  const playSound = useCallback(async (soundType?: string) => {
    if (!settings.sound || !audioRef.current) return

    try {
      const sound = soundType || settings.soundType
      audioRef.current.src = getSoundPath(sound)
      audioRef.current.volume = settings.volume
      
      // Reset and play
      audioRef.current.currentTime = 0
      await audioRef.current.play()
    } catch (error) {
      console.error('Failed to play notification sound:', error)
    }
  }, [settings.sound, settings.volume, settings.soundType])

  const showBrowserNotification = useCallback(async (options: NotificationOptions) => {
    if (!settings.browser || !('Notification' in window)) return null

    if (permission !== 'granted') {
      const newPermission = await requestPermission()
      if (newPermission !== 'granted') {
        return null
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag || 'pomodoro',
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
      })

      // Auto close after 5 seconds if not requiring interaction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      return notification
    } catch (error) {
      console.error('Failed to show browser notification:', error)
      return null
    }
  }, [settings.browser, permission, requestPermission])

  const notify = useCallback(async (options: NotificationOptions & { sound?: string }) => {
    const promises: Promise<any>[] = []

    // Play sound
    if (settings.sound) {
      promises.push(playSound(options.sound))
    }

    // Show browser notification
    if (settings.browser) {
      promises.push(showBrowserNotification(options))
    }

    await Promise.allSettled(promises)
  }, [settings.sound, settings.browser, playSound, showBrowserNotification])

  // Predefined notification types
  const notifySessionComplete = useCallback((sessionType: string, taskTitle?: string) => {
    const titles = {
      work: '🍅 Work Session Complete!',
      short_break: '☕ Short Break Complete!',
      long_break: '🌟 Long Break Complete!'
    }

    const bodies = {
      work: taskTitle 
        ? `Great job on "${taskTitle}"! Time for a well-deserved break.`
        : 'Great job! Time for a well-deserved break.',
      short_break: 'Break time is over. Ready to get back to work?',
      long_break: 'You\'re refreshed and ready! Time to tackle your next task.'
    }

    notify({
      title: titles[sessionType as keyof typeof titles] || 'Session Complete!',
      body: bodies[sessionType as keyof typeof bodies] || 'Your Pomodoro session is complete.',
      tag: 'session-complete',
      requireInteraction: true,
      sound: sessionType === 'work' ? 'chime' : 'bell'
    })
  }, [notify])

  const notifySessionStart = useCallback((sessionType: string, taskTitle?: string) => {
    const titles = {
      work: '🚀 Work Session Started',
      short_break: '☕ Short Break Started',
      long_break: '🌟 Long Break Started'
    }

    const bodies = {
      work: taskTitle 
        ? `Focus time! Working on "${taskTitle}"`
        : 'Focus time! Let\'s get productive.',
      short_break: 'Take a quick break. You\'ve earned it!',
      long_break: 'Enjoy your long break. Relax and recharge!'
    }

    notify({
      title: titles[sessionType as keyof typeof titles] || 'Session Started',
      body: bodies[sessionType as keyof typeof bodies] || 'Your Pomodoro session has started.',
      tag: 'session-start',
      requireInteraction: false,
      silent: true,
      sound: 'digital'
    })
  }, [notify])

  const notifyMinuteWarning = useCallback((minutes: number) => {
    notify({
      title: `⏰ ${minutes} minute${minutes > 1 ? 's' : ''} remaining`,
      body: 'Your session is almost complete. Stay focused!',
      tag: 'time-warning',
      requireInteraction: false,
      silent: true,
      sound: 'nature'
    })
  }, [notify])

  const testNotification = useCallback(() => {
    notify({
      title: '🧪 Test Notification',
      body: 'This is a test notification to check your settings.',
      tag: 'test',
      requireInteraction: false,
    })
  }, [notify])

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  return {
    // State
    permission,
    settings,
    isSupported: 'Notification' in window,
    
    // Actions
    requestPermission,
    playSound,
    showBrowserNotification,
    notify,
    notifySessionComplete,
    notifySessionStart,
    notifyMinuteWarning,
    testNotification,
    updateSettings,
  }
}

// Helper function to get sound file paths
function getSoundPath(soundType: string): string {
  const basePath = '/sounds'
  
  switch (soundType) {
    case 'chime':
      return `${basePath}/chime.mp3`
    case 'bell':
      return `${basePath}/bell.mp3`
    case 'digital':
      return `${basePath}/digital.mp3`
    case 'nature':
      return `${basePath}/nature.mp3`
    default:
      return `${basePath}/chime.mp3`
  }
}

// Hook for integrating notifications with Pomodoro timer
export function usePomodoroNotifications() {
  const notifications = useNotifications()
  const [hasNotifiedWarning, setHasNotifiedWarning] = useState(false)

  const handleSessionComplete = useCallback((sessionType: string, taskTitle?: string) => {
    notifications.notifySessionComplete(sessionType, taskTitle)
    setHasNotifiedWarning(false) // Reset warning flag
  }, [notifications])

  const handleSessionStart = useCallback((sessionType: string, taskTitle?: string) => {
    notifications.notifySessionStart(sessionType, taskTitle)
    setHasNotifiedWarning(false) // Reset warning flag
  }, [notifications])

  const handleTimeWarning = useCallback((remainingMinutes: number) => {
    // Only notify once per session when 5 minutes or 1 minute remaining
    if (!hasNotifiedWarning && (remainingMinutes === 5 || remainingMinutes === 1)) {
      notifications.notifyMinuteWarning(remainingMinutes)
      setHasNotifiedWarning(true)
    }
  }, [notifications, hasNotifiedWarning])

  const resetWarningFlag = useCallback(() => {
    setHasNotifiedWarning(false)
  }, [])

  return {
    ...notifications,
    handleSessionComplete,
    handleSessionStart,
    handleTimeWarning,
    resetWarningFlag,
  }
}