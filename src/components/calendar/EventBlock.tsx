import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/types"
import { useCalendarStore } from "@/stores/calendarStore"

const statusStyles: Record<string, string> = {
  draft:
    "border-l-4 border-l-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50",
  confirmed:
    "border-l-4 border-l-blue-400 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50",
  auto_published:
    "border-l-4 border-l-green-400 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50",
}

const statusBadge: Record<string, { label: string; className: string }> = {
  draft: {
    label: "待确认",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
  confirmed: {
    label: "已确认",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  },
  auto_published: {
    label: "已发布",
    className: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  },
}

interface EventBlockProps {
  event: CalendarEvent
  style?: React.CSSProperties
}

export function EventBlock({ event, style }: EventBlockProps) {
  const selectEvent = useCalendarStore((s) => s.selectEvent)
  const badge = statusBadge[event.status]

  return (
    <button
      onClick={() => selectEvent(event)}
      style={style}
      className={cn(
        "absolute inset-x-1 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer overflow-hidden",
        statusStyles[event.status]
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="font-medium text-foreground truncate leading-tight">
          {event.title}
        </span>
        <span
          className={cn(
            "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none",
            badge.className
          )}
        >
          {badge.label}
        </span>
      </div>
      <p className="mt-0.5 text-[10px] text-muted-foreground">
        {format(event.startTime, "HH:mm")} – {format(event.endTime, "HH:mm")}
      </p>
    </button>
  )
}
