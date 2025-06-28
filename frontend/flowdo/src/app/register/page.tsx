import { RegisterForm } from '@/components/auth/register-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create a FlowDo Account',
  description: 'Sign up for FlowDo to manage your tasks and pomodoro sessions',
}

export default function RegisterPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Join FlowDo</h1>
          <p className="text-muted-foreground">
            Create an account to start managing your tasks with FlowDo
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
} 