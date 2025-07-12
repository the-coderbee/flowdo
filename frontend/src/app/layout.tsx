import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { AuthProvider } from "@/lib/providers/auth-provider";
import { QueryProvider } from "@/lib/providers/query-provider";
import { ReactQueryDevtoolsProvider } from "@/components/react-query-devtools";
import { OfflineIndicator } from "@/components/ui/offline-indicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowDo - Master Your Focus & Flow",
  description: "Transform your productivity with FlowDo's powerful task management and Pomodoro technique integration. Stay focused, organized, and in control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <OfflineIndicator />
            <ReactQueryDevtoolsProvider />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
