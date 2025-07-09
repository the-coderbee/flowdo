import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  text 
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-muted border-t-primary',
            sizeClasses[size]
          )}
        />
        {text && (
          <p className="text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  )
}

export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <LoadingSpinner size="sm" />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

export default LoadingSpinner