"use client"

import React from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

interface RouteErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface RouteErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

export class RouteErrorBoundary extends React.Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route Error:', error, errorInfo)
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

      return <DefaultRouteErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultRouteErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="space-y-3">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">
            We&apos;re sorry, but an unexpected error occurred while loading this page.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertDescription>
            <strong>Error Details:</strong>
            <br />
            <code className="text-xs mt-1 block bg-muted p-2 rounded">
              {error.message}
            </code>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={resetError} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button 
            onClick={() => router.push('/')} 
            variant="outline"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RouteErrorBoundary