import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Sparkles,
  Check,
  SkipForward,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCalendarStore } from "@/stores/calendarStore"
import { EventDetailPanel } from "@/components/calendar/EventDetailPanel"
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

function AiEventCard({
  event,
  onClick,
  isSelected,
}: {
  event: CalendarEvent
  onClick: () => void
  isSelected: boolean
}) {
  const isDraft = event.status === "draft"
  const isConfirmed = event.status === "confirmed"
  const isAuto = event.status === "auto-published"
  const isSkipped = event.status === "skipped"

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border-l-[3px] px-3 py-2.5 space-y-1.5 transition-all cursor-pointer",
        isDraft && "border-l-amber-500 bg-amber-50/80 hover:bg-amber-100/70",
        isConfirmed && "border-l-green-500 bg-green-50/80 hover:bg-green-100/70",
        isAuto && "border-l-blue-500 bg-blue-50/80 hover:bg-blue-100/70",
        isSkipped && "border-l-stone-300 bg-stone-50/80 hover:bg-stone-100/70 opacity-60",
        isSelected && "ring-2 ring-amber-300 shadow-sm",
      )}
    >
      <div className="flex items-start gap-1.5">
        <Sparkles className={cn(
          "size-3.5 mt-0.5 shrink-0",
          isDraft ? "text-amber-500" : isConfirmed ? "text-green-500" : isAuto ? "text-blue-500" : "text-stone-400",
        )} />
        <p className={cn(
          "text-[12px] font-medium leading-snug flex-1",
          isDraft ? "text-amber-900" : isConfirmed ? "text-green-800" : isAuto ? "text-blue-800" : "text-stone-500",
        )}>
          {event.title}
        </p>
      </div>

      <div className="flex items-center gap-2 ml-5">
        {isDraft && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-100 rounded-full px-1.5 py-0.5">
            🟡 待确认
          </span>
        )}
        {isConfirmed && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-green-600">
            <Check className="size-2.5" /> 已发布
          </span>
        )}
        {isAuto && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600">
            <Check className="size-2.5" /> 自动发布
          </span>
        )}
        {isSkipped && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-stone-400">
            <SkipForward className="size-2.5" /> 已跳过
          </span>
        )}
        <span className="text-[10px] text-stone-400">{event.startTime}</span>
      </div>
    </button>
  )
}

function RegularEventCard({ event }: { event: CalendarEvent }) {
  const colorMap: Record<string, string> = {
    blue: "border-l-blue-400 bg-blue-50/60",
    purple: "border-l-purple-400 bg-purple-50/60",
    green: "border-l-green-400 bg-green-50/60",
    red: "border-l-red-400 bg-red-50/60",
    amber: "border-l-amber-400 bg-amber-50/60",
  }

  return (
    <div className={cn("rounded-lg border-l-[3px] px-3 py-2.5 space-y-1", colorMap[event.color] ?? colorMap.blue)}>
      <p className="text-[12px] font-medium text-stone-800 leading-snug">
        {event.title}
      </p>
      {event.tags && event.tags.length > 0 && (
        <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
          <User className="size-3" />
          <span>{event.tags.join(" · ")}</span>
        </div>
      )}
      <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
        <Clock className="size-3" />
        <span>{event.startTime} - {event.endTime}</span>
      </div>
    </div>
  )
}

export function CalendarView() {
  const { currentDate, events, nextWeek, prevWeek, selectedEventId, selectEvent } =
    useCalendarStore()

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const sameMonth = weekStart.getMonth() === weekEnd.getMonth()
  const weekLabel = sameMonth
    ? `${format(weekStart, "yyyy年M月d日")} - ${format(weekEnd, "d日")}`
    : `${format(weekStart, "M月d日")} - ${format(weekEnd, "M月d日")}`

  const hasSelection = selectedEventId !== null

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
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
            const dayEvents = events
              .filter((e) => e.date === dateStr)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex flex-1 flex-col border-r border-border last:border-r-0 min-w-0",
                )}
              >
                {/* day column header */}
                <div
                  className={cn(
                    "px-2 py-3 border-b border-border",
                    isToday && "bg-amber-50/50",
                  )}
                >
                  <p className="text-[11px] text-muted-foreground font-medium tracking-wide">
                    {WEEKDAY_LABELS[idx]}
                  </p>
                  <p
                    className={cn(
                      "text-xl font-bold mt-0.5",
                      isToday ? "text-amber-700" : "text-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </p>
                </div>

                {/* events */}
                <div
                  className={cn(
                    "flex-1 overflow-y-auto p-2 space-y-2",
                    isToday && "bg-amber-50/20",
                  )}
                >
                  {dayEvents.map((event) =>
                    event.isAiGenerated ? (
                      <AiEventCard
                        key={event.id}
                        event={event}
                        onClick={() => selectEvent(event.id)}
                        isSelected={selectedEventId === event.id}
                      />
                    ) : (
                      <RegularEventCard key={event.id} event={event} />
                    ),
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* detail panel */}
      {hasSelection && <EventDetailPanel />}
    </div>
  )
}
