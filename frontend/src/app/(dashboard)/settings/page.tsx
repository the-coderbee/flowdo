// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and application preferences
        </p>
      </div>
      
      <div className="text-center py-12 text-muted-foreground">
        <p>Settings content will appear here</p>
      </div>
    </div>
  )
}