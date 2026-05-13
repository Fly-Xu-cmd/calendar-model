import { format, isSameDay } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useCalendarStore } from "@/stores/calendarStore"
import { TimeGrid } from "./TimeGrid"
import { EventDetail } from "./EventDetail"

export function DayView() {
  const currentDate = useCalendarStore((s) => s.currentDate)
  const events = useCalendarStore((s) => s.events)
  const selectedEvent = useCalendarStore((s) => s.selectedEvent)

  const liveEvent = selectedEvent
    ? events.find((e) => e.id === selectedEvent.id) ?? null
    : null

  const days = [currentDate]
  const isToday = isSameDay(currentDate, new Date())

  return (
    <div className="flex h-full flex-col">
      {/* day header */}
      <div className="flex items-center justify-center gap-3 border-b border-border py-3">
        <h2 className="text-lg font-bold text-foreground">
          {format(currentDate, "M月d日 EEEE", { locale: zhCN })}
        </h2>
        {isToday && (
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
            今天
          </span>
        )}
      </div>

      <TimeGrid days={days} events={events} />

      {liveEvent && <EventDetail event={liveEvent} />}
    </div>
  )
}
