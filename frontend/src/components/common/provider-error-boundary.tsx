"use client"

import React from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ProviderErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ProviderErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  providerName?: string
}

export class ProviderErrorBoundary extends React.Component<
  ProviderErrorBoundaryProps,
  ProviderErrorBoundaryState
> {
  constructor(props: ProviderErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ProviderErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`${this.props.providerName || 'Provider'} Error:`, error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="space-y-3">
                <div>
                  <strong>
                    {this.props.providerName ? `${this.props.providerName} Error` : 'Application Error'}
                  </strong>
                </div>
                <p className="text-sm text-muted-foreground">
                  {this.state.error.message || 'An unexpected error occurred'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.resetError}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ProviderErrorBoundary