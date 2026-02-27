import { cn } from "@/lib/utils"

type Severity = "high" | "medium" | "low"

interface SeverityBadgeProps {
  severity: Severity
  className?: string
}

const severityConfig = {
  high: { color: "bg-red-500", text: "text-red-600", label: "High" },
  medium: { color: "bg-amber-500", text: "text-amber-600", label: "Medium" },
  low: { color: "bg-blue-500", text: "text-blue-600", label: "Low" },
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity]
  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-white text-xs font-semibold uppercase",
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}
