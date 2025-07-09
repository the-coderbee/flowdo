export interface DashboardData {
    stats: {
      tasks_today: {
        total: number
        completed: number
        pending: number
        completion_rate: number
      }
      focus_today: {
        sessions_completed: number
        total_minutes: number
        goal_progress: number
      }
      productivity_score: number
      current_streak: number
    }
    trends: {
      completion_chart: Array<{
        date: string
        completed: number
        total: number
        rate: number
      }>
      focus_chart: Array<{
        date: string
        minutes: number
        sessions: number
      }>
    }
    recent: {
      completed_tasks: Array<{
        id: number
        title: string
        completed_at: string
      }>
      upcoming_deadlines: Array<{
        id: number
        title: string
        due_date: string
        priority: string
      }>
      active_pomodoro: {
        is_active: boolean
        time_remaining?: number
        session_type?: 'work' | 'break'
      } | null
    }
    goals: {
      daily_task_goal: {
        target: number
        current: number
        progress: number
      }
      daily_focus_goal: {
        target: number
        current: number
        progress: number
      }
    }
  }