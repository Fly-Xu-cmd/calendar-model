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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCalendarStore } from "@/stores/calendarStore"
import { EventDetailPanel } from "@/components/calendar/EventDetailPanel"
import { SkillHashGlyph } from "@/components/calendar/SkillHashGlyph"
import type { CalendarEvent } from "@/types"

const WEEKDAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

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

  let statusText = ""
  if (isDraft) statusText = "待确认"
  else if (isConfirmed) statusText = "已发布"
  else if (isAuto) statusText = "自动发布"
  else if (isSkipped) statusText = "已跳过"

  return (
    <div
      data-ai-event-row
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick() } }}
      className={cn(
        "group flex w-full cursor-pointer select-none items-center p-3 text-left",
        "rounded-xl border border-slate-200 bg-white transition-[background-color,box-shadow] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:bg-slate-50 hover:shadow-sm",
        isSkipped && "opacity-50",
        isSelected && "bg-slate-100 border-slate-300 shadow-sm",
      )}
    >
      {/* icon */}
      <div className="me-3 shrink-0">
        <SkillHashGlyph seedText={event.id} size={36} />
      </div>

      {/* text */}
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium leading-snug text-[#0d0d0d]" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {event.title}
        </p>
        <p className="truncate text-[11px] font-normal leading-4 text-[#8f8f8f] mt-0.5">
          {event.startTime} · {statusText}
        </p>
      </div>

      {/* trailing */}
      <div className="shrink-0 text-[#8f8f8f] group-hover:text-[#0d0d0d] transition-colors duration-200">
        <ChevronRight className="size-4" strokeWidth={2} />
      </div>
    </div>
  )
}

function RegularEventCard({ event }: { event: CalendarEvent }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 space-y-1">
      <p className="text-[12px] font-medium text-slate-700 leading-snug">
        {event.title}
      </p>
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
        <Clock className="size-3" />
        <span>{event.startTime} - {event.endTime}</span>
        {event.tags && event.tags.length > 0 && (
          <>
            <span>·</span>
            <span>{event.tags.join(" · ")}</span>
          </>
        )}
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
        <div className="flex items-center gap-2 sm:gap-3 border-b border-slate-200 px-3 sm:px-5 py-2.5 sm:py-3 bg-white">
          <Button variant="ghost" size="icon-sm" onClick={prevWeek}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-xs sm:text-sm font-semibold text-slate-700 min-w-0 flex-1 sm:flex-none sm:min-w-[180px] text-center truncate">
            {weekLabel}
          </span>
          <Button variant="ghost" size="icon-sm" onClick={nextWeek}>
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* grid */}
        <div className="flex flex-1 overflow-x-auto overflow-y-hidden">
          {days.map((day, idx) => {
            const isToday = isSameDay(day, new Date())
            const dateStr = format(day, "yyyy-MM-dd")
            const dayEvents = events
              .filter((e) => e.date === dateStr)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))

            return (
              <div
                key={day.toISOString()}
                className="flex flex-col border-r border-slate-100 last:border-r-0 min-w-[140px] sm:min-w-0 sm:flex-1"
              >
                <div
                  className={cn(
                    "px-2 py-2.5 sm:py-3 border-b border-slate-100",
                    isToday && "bg-blue-50/40",
                  )}
                >
                  <p className="text-[10px] text-slate-400 font-medium tracking-wider">
                    {WEEKDAY_LABELS[idx]}
                  </p>
                  <p
                    className={cn(
                      "text-lg sm:text-xl font-bold mt-0.5",
                      isToday ? "text-blue-600" : "text-slate-700",
                    )}
                  >
                    {format(day, "d")}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-1.5 bg-slate-50/30">
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

      {hasSelection && <EventDetailPanel />}
    </div>
  )
}
