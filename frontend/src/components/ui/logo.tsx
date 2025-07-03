import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("rounded-lg bg-gradient-to-br from-teal-700 to-teal-500 flex items-center justify-center", sizeClasses[size])}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-1/2 w-1/2 text-white"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className={cn("font-bold text-foreground", {
        "text-lg": size === "sm",
        "text-xl": size === "md", 
        "text-2xl": size === "lg"
      })}>
        FlowDo
      </span>
    </div>
  )
}