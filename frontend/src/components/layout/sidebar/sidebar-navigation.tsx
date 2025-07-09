import { usePathname } from "next/navigation"
import { SidebarMenuItem } from "./sidebar-menu-item"
import { topMenuItems, bottomMenuItems } from "./sidebar-config"

interface SidebarNavigationProps {
  isCollapsed: boolean
  className?: string
}

export function SidebarNavigation({ isCollapsed, className }: SidebarNavigationProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Top Menu Items */}
      <nav className={`flex flex-col space-y-2 ${className}`}>
        {topMenuItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <SidebarMenuItem
              key={item.href}
              item={item}
              isActive={isActive}
              isCollapsed={isCollapsed}
            />
          )
        })}
      </nav>

      {/* Divider */}
      <div className="my-4 border-t border-border" />

      {/* Bottom Menu Items */}
      <nav className="flex flex-col space-y-2 mt-auto">
        {bottomMenuItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <SidebarMenuItem
              key={item.href}
              item={item}
              isActive={isActive}
              isCollapsed={isCollapsed}
            />
          )
        })}
      </nav>
    </>
  )
}

export default SidebarNavigation