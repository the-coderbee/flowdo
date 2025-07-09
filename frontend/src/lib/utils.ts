import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export utilities from utils directory
export * from "./utils/constants"
export * from "./utils/date" 
export * from "./utils/formatting"
export * from "./utils/validation"