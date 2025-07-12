"use client"

import { useOnlineStatus } from '@/lib/hooks/use-online-status'
import { WifiOff } from 'lucide-react'

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">You&apos;re offline</span>
    </div>
  )
}