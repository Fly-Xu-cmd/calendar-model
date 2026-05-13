import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from "date-fns"
import { ChevronLeft, ChevronRight, Clock, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCalendarStore } from "@/stores/calendarStore"
import type { CalendarEvent } from "@/types"

const WEEKDAY_LABELS = [
  "周一 / MON",
  "周二 / TUE",
  "周三 / WED",
  "周四 / THU",
  "周五 / FRI",
  "周六 / SAT",
  "周日 / SUN",
]

function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <div className="rounded-lg border-l-[3px] border-l-amber-500 bg-amber-50/80 px-3 py-2.5 space-y-1">
      <p className="text-[13px] font-medium text-amber-900 leading-snug">
        {event.title}
      </p>
      {event.tags && event.tags.length > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-700/70">
          <User className="size-3" />
          <span>{event.tags.join(" · ")}</span>
        </div>
      )}
      <div className="flex items-center gap-1.5 text-[11px] text-amber-700/70">
        <Clock className="size-3" />
        <span>{event.startTime}</span>
      </div>
    </div>
  )
}

export function CalendarView() {
  const { currentDate, events, nextWeek, prevWeek } = useCalendarStore()

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const weekLabel = `${format(weekStart, "yyyy年M月d日")} - ${format(weekEnd, "d日")}`

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* week header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-3">
        <Button variant="ghost" size="icon-sm" onClick={prevWeek}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-semibold text-foreground min-w-[180px] text-center">
          {weekLabel}
        </span>
        <Button variant="ghost" size="icon-sm" onClick={nextWeek}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* grid */}
      <div className="flex flex-1 overflow-hidden">
        {days.map((day, idx) => {
          const isToday = isSameDay(day, new Date())
          const dateStr = format(day, "yyyy-MM-dd")
          const dayEvents = events.filter((e) => e.date === dateStr)

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "flex flex-1 flex-col border-r border-border last:border-r-0 min-w-0",
              )}
            >
              {/* day column header */}
              <div className={cn(
                "px-2 py-3 border-b border-border",
                isToday && "bg-amber-50/50",
              )}>
                <p className="text-[11px] text-muted-foreground font-medium tracking-wide">
                  {WEEKDAY_LABELS[idx]}
                </p>
                <p className={cn(
                  "text-xl font-bold mt-0.5",
                  isToday ? "text-amber-700" : "text-foreground",
                )}>
                  {format(day, "d")}
                </p>
              </div>

              {/* events */}
              <div className={cn(
                "flex-1 overflow-y-auto p-2 space-y-2",
                isToday && "bg-amber-50/20",
              )}>
                {dayEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
