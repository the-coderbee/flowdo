import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - FlowDo",
  description: "Sign in or create an account to access FlowDo",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}