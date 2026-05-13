import { addDays, format, isSameDay, startOfWeek, endOfWeek, isSameMonth } from "date-fns"
import { zhCN } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useCalendarStore } from "@/stores/calendarStore"
import { TimeGrid } from "./TimeGrid"
import { EventDetail } from "./EventDetail"

export function WeekView() {
  const currentDate = useCalendarStore((s) => s.currentDate)
  const events = useCalendarStore((s) => s.events)
  const selectedEvent = useCalendarStore((s) => s.selectedEvent)

  const liveEvent = selectedEvent
    ? events.find((e) => e.id === selectedEvent.id) ?? null
    : null

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const weekLabel = isSameMonth(weekStart, weekEnd)
    ? format(weekStart, "yyyy年M月", { locale: zhCN })
    : `${format(weekStart, "M月d日", { locale: zhCN })} – ${format(weekEnd, "M月d日", { locale: zhCN })}`

  return (
    <div className="flex h-full flex-col">
      {/* week title */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2">
        <div className="w-12" />
        <h2 className="text-sm font-semibold text-foreground">{weekLabel}</h2>
        <span className="text-xs text-muted-foreground">
          第 {format(weekStart, "w")} 周
        </span>
      </div>

      {/* day header */}
      <div className="flex border-b border-border">
        <div className="w-16 shrink-0" />
        <div className="flex flex-1">
          {days.map((day) => {
            const isToday = isSameDay(day, new Date())
            return (
              <div
                key={day.toISOString()}
                className="flex flex-1 flex-col items-center py-2.5"
              >
                <span className="text-xs text-muted-foreground">
                  {format(day, "EEE", { locale: zhCN })}
                </span>
                <span
                  className={cn(
                    "mt-0.5 flex size-8 items-center justify-center rounded-full text-sm font-medium",
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <TimeGrid days={days} events={events} />

      {liveEvent && <EventDetail event={liveEvent} />}
    </div>
  )
}
