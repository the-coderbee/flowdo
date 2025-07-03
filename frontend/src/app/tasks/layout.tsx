import { Navbar } from "@/components/navbar"

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {children}
    </div>
  )
}