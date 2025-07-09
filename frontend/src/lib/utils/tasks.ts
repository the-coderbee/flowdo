export function getPageTitle(pathname: string): string {
  if (pathname === "/tasks") return "All Tasks"
  if (pathname === "/my-day") return "My Day"
  if (pathname === "/starred") return "Starred"
  if (pathname === "/pomodoro") return "Pomodoro Sessions"
  if (pathname === "/settings") return "Configurations"
  if (pathname.startsWith("/tasks/groups/")) {
    const groupId = pathname.split("/").pop()
    return `${groupId?.charAt(0).toUpperCase()}${groupId?.slice(1)} Tasks`
  }
  return "Tasks"
}