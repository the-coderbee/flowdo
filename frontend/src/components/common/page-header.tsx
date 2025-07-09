import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  className?: string
  children?: ReactNode
}

export function PageHeader({
  title,
  description,
  actions,
  badge,
  className,
  children
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {badge && (
              <Badge variant={badge.variant}>{badge.text}</Badge>
            )}
          </div>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

interface PageHeaderActionProps {
  children: ReactNode
  className?: string
}

export function PageHeaderActions({ children, className }: PageHeaderActionProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {children}
    </div>
  )
}

interface SimplePageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
}

export function SimplePageHeader({
  title,
  description,
  action
}: SimplePageHeaderProps) {
  return (
    <PageHeader
      title={title}
      description={description}
      actions={
        action && (
          <Button
            onClick={action.onClick}
            variant={action.variant}
          >
            {action.label}
          </Button>
        )
      }
    />
  )
}

export default PageHeader