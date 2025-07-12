'use client'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function ReactQueryDevtoolsProvider() {
  return (
    <>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  )
}