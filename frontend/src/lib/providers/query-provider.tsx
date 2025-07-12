'use client'

import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/react-query'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Initialize the query client on the client side only
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}