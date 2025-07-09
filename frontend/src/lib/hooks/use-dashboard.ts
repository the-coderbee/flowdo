import { useState, useEffect } from "react"
import { DashboardData } from "@/types/dashboard"
import { apiClient } from "@/lib/api/client"

export function useDashboard() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
  
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const summary = await apiClient.get<DashboardData>('/api/dashboard/summary')
        setData(summary)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
  
    useEffect(() => {
      fetchDashboard()
      
      // Refresh every 60 seconds
      const interval = setInterval(fetchDashboard, 60000)
      return () => clearInterval(interval)
    }, [])
  
    return {
      data,
      loading,
      error,
      refresh: fetchDashboard
    }
  }