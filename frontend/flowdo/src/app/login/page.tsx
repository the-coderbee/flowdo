import { LoginForm } from '@/components/auth/login-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login to FlowDo',
  description: 'Login to your FlowDo account to manage your tasks and pomodoro sessions',
}

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome back to FlowDo</h1>
          <p className="text-muted-foreground">
            Log in to your account to continue managing your tasks
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
} 