interface TagColorPickerProps {
  selectedColor: string
  onColorChange: (color: string) => void
  colors?: string[]
  className?: string
}

const defaultColors = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#ec4899", // pink
  "#6b7280", // gray
  "#14b8a6", // teal
  "#a855f7", // purple
]

export function TagColorPicker({ 
  selectedColor, 
  onColorChange, 
  colors = defaultColors,
  className 
}: TagColorPickerProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-foreground">Color</label>
      <div className="grid grid-cols-6 gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            className={`
              w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110
              ${selectedColor === color 
                ? 'border-foreground ring-2 ring-background ring-offset-2' 
                : 'border-border'
              }
            `}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  )
}

export default TagColorPicker