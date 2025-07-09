"use client"

import { AuthProvider } from "./auth-provider"
import { TaskProvider } from "./task-provider" 
import { DashboardProvider } from "./dashboard-provider"
import { GroupProvider } from "./group-provider"
import { ProviderErrorBoundary } from "@/components/common/provider-error-boundary"
import { AuthLoadingGuard } from "@/components/common/auth-loading-guard"
import { ThemeProvider } from "next-themes"

interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ProviderErrorBoundary providerName="Theme Provider">
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem 
        disableTransitionOnChange
      >
        <ProviderErrorBoundary providerName="Auth Provider">
          <AuthProvider>
            <AuthLoadingGuard>
              <ProviderErrorBoundary providerName="Task Provider">
                <TaskProvider>
                  <ProviderErrorBoundary providerName="Dashboard Provider">
                    <DashboardProvider>
                      <ProviderErrorBoundary providerName="Group Provider">
                        <GroupProvider>
                          {children}
                        </GroupProvider>
                      </ProviderErrorBoundary>
                    </DashboardProvider>
                  </ProviderErrorBoundary>
                </TaskProvider>
              </ProviderErrorBoundary>
            </AuthLoadingGuard>
          </AuthProvider>
        </ProviderErrorBoundary>
      </ThemeProvider>
    </ProviderErrorBoundary>
  )
}

export default AppProviders