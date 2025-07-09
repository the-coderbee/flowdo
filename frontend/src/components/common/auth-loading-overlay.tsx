"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface AuthLoadingOverlayProps {
  isVisible: boolean
  message?: string
  submessage?: string
  timeout?: number
  onTimeout?: () => void
}

export const AuthLoadingOverlay = ({ 
  isVisible, 
  message = "Verifying authentication...",
  submessage = "Please wait while we secure your session",
  timeout = 10000, // 10 seconds default timeout
  onTimeout
}: AuthLoadingOverlayProps) => {
  const [showTimeout, setShowTimeout] = useState(false)

  useEffect(() => {
    if (!isVisible) {
      setShowTimeout(false)
      return
    }

    const timer = setTimeout(() => {
      setShowTimeout(true)
      onTimeout?.()
    }, timeout)

    return () => clearTimeout(timer)
  }, [isVisible, timeout, onTimeout])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-card border border-border rounded-lg shadow-lg p-8 max-w-md w-full mx-4"
          >
            <div className="flex flex-col items-center space-y-6">
              {/* Logo or brand */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">F</span>
                </div>
                <span className="text-xl font-semibold text-foreground">FlowDo</span>
              </div>

              {/* Loading spinner */}
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-0 w-12 h-12 border-2 border-transparent border-r-primary/40 rounded-full"
                />
              </div>

              {/* Messages */}
              <div className="text-center space-y-2">
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg font-medium text-foreground"
                >
                  {message}
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-muted-foreground"
                >
                  {submessage}
                </motion.p>
              </div>

              {/* Timeout message */}
              {showTimeout && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                >
                  <p className="text-sm text-destructive font-medium">
                    Authentication is taking longer than expected
                  </p>
                  <p className="text-xs text-destructive/80 mt-1">
                    You may need to refresh the page or try again
                  </p>
                </motion.div>
              )}

              {/* Progress dots */}
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="w-2 h-2 bg-primary/60 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Simpler version without animations for performance-critical scenarios
export const SimpleAuthLoadingOverlay = ({ 
  isVisible, 
  message = "Loading..." 
}: { 
  isVisible: boolean
  message?: string 
}) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border border-border rounded-lg shadow-lg p-6 flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}