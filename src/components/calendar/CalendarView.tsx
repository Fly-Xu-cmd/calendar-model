import {
  format,
  addDays,
  isSameDay,
  isAfter,
} from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  CalendarDays,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCalendarStore } from "@/stores/calendarStore"
import { SkillHashGlyph } from "@/components/calendar/SkillHashGlyph"
import type { CalendarEvent } from "@/types"

const WEEKDAY_LABELS_MAP: Record<number, string> = {
  0: "SUN", 1: "MON", 2: "TUE", 3: "WED", 4: "THU", 5: "FRI", 6: "SAT",
}

function LoadingEventCard({ event, onClick }: { event: CalendarEvent; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={cn("group flex w-full items-center p-3 rounded-xl border border-blue-200/60 bg-gradient-to-r from-blue-50/50 to-white/50 ai-event-streaming", onClick && "cursor-pointer")}>
      <div className="me-3 shrink-0 relative">
        <SkillHashGlyph seedText={event.id} size={36} />
        <div className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-white shadow-sm">
          <Loader2 className="size-3 animate-spin text-blue-400" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="h-3 w-3/4 rounded bg-slate-200/60 animate-pulse mb-1.5" />
        <p className="text-sm text-blue-400 font-medium">正在准备…</p>
      </div>
    </div>
  )
}

function AiEventCard({
  event,
  onClick,
  isSelected,
  isStreaming,
  isFuture,
}: {
  event: CalendarEvent
  onClick: () => void
  isSelected: boolean
  isStreaming: boolean
  isFuture: boolean
}) {
  const isDraft = event.status === "draft"
  const isConfirmed = event.status === "confirmed"
  const isAuto = event.status === "auto-published"
  const isSkipped = event.status === "skipped"

  let statusText = ""
  if (isStreaming) statusText = "生成中…"
  else if (isFuture) statusText = "计划中"
  else if (isDraft) statusText = "待确认"
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
        "group relative flex w-full cursor-pointer select-none items-center p-3 text-left",
        "rounded-xl border bg-white transition-[background-color,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:bg-slate-50 hover:shadow-sm",
        isSkipped && "opacity-50",
        isFuture && "opacity-70 border-dashed",
        isSelected && "bg-slate-100 border-slate-300 shadow-sm",
        isStreaming
          ? "border-blue-300 ai-event-streaming"
          : "border-slate-200",
      )}
    >
      {isStreaming && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="ai-shimmer absolute inset-0" />
        </div>
      )}

      <div className="me-3 shrink-0 relative z-[1]">
        <SkillHashGlyph seedText={event.id} size={36} />
      </div>

      <div className="min-w-0 flex-1 relative z-[1]">
        <p className="text-[15px] font-medium leading-snug text-[#0d0d0d]" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {event.title}
        </p>
        <p className={cn(
          "truncate text-sm font-normal leading-4 mt-0.5",
          isStreaming ? "text-blue-500" : isFuture ? "text-slate-400 italic" : "text-[#8f8f8f]",
        )}>
          {event.startTime} · {statusText}
        </p>
      </div>

      <div className={cn(
        "shrink-0 transition-colors duration-200 relative z-[1]",
        isStreaming ? "text-blue-400" : "text-[#8f8f8f] group-hover:text-[#0d0d0d]",
      )}>
        {isFuture ? (
          <CalendarDays className="size-4" strokeWidth={2} />
        ) : (
          <ChevronRight className="size-4" strokeWidth={2} />
        )}
      </div>
    </div>
  )
}

function StackedEventCards({
  events,
  onEventClick,
  floatingEventIds,
  streamingEventId,
}: {
  events: CalendarEvent[]
  onEventClick: (id: string) => void
  floatingEventIds: string[]
  streamingEventId: string | null
}) {
  const aiEvents = events.filter((e) => e.isAiGenerated)
  const today = new Date()

  if (aiEvents.length <= 1) {
    return (
      <>
        {events.map((event) =>
          event.status === "loading" ? (
            <LoadingEventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} />
          ) : event.isAiGenerated ? (
            <AiEventCard
              key={event.id}
              event={event}
              onClick={() => onEventClick(event.id)}
              isSelected={floatingEventIds.includes(event.id)}
              isStreaming={streamingEventId === event.id}
              isFuture={isAfter(new Date(event.date), today) && !isSameDay(new Date(event.date), today)}
            />
          ) : (
            <RegularEventCard key={event.id} event={event} />
          ),
        )}
      </>
    )
  }

  const regularEvents = events.filter((e) => !e.isAiGenerated)

  return (
    <>
      {regularEvents.map((event) => (
        <RegularEventCard key={event.id} event={event} />
      ))}
      <div className="stacked-cards relative">
        {aiEvents.map((event, idx) => (
          <div
            key={event.id}
            className={cn(
              "stacked-card-item",
              idx > 0 && "stacked-card-offset",
            )}
            style={{
              "--stack-index": idx,
              "--stack-total": aiEvents.length,
            } as React.CSSProperties}
          >
            {event.status === "loading" ? (
              <LoadingEventCard event={event} onClick={() => onEventClick(event.id)} />
            ) : (
              <AiEventCard
                event={event}
                onClick={() => onEventClick(event.id)}
                isSelected={floatingEventIds.includes(event.id)}
                isStreaming={streamingEventId === event.id}
                isFuture={isAfter(new Date(event.date), today) && !isSameDay(new Date(event.date), today)}
              />
            )}
          </div>
        ))}
      </div>
    </>
  )
}

function RegularEventCard({ event }: { event: CalendarEvent }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 space-y-1">
      <p className="text-[15px] font-medium text-slate-700 leading-snug">
        {event.title}
      </p>
      <div className="flex items-center gap-1.5 text-sm text-slate-400">
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
  const { currentDate, events, nextWeek, prevWeek, floatingEventIds, openFloating, streamingEventId } =
    useCalendarStore()

  const days = Array.from({ length: 7 }, (_, i) => addDays(currentDate, i))
  const firstDay = days[0]
  const lastDay = days[6]

  const sameMonth = firstDay.getMonth() === lastDay.getMonth()
  const weekLabel = sameMonth
    ? `${format(firstDay, "yyyy年M月d日")} - ${format(lastDay, "d日")}`
    : `${format(firstDay, "M月d日")} - ${format(lastDay, "M月d日")}`

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        {/* week header */}
        <div className="flex items-center gap-2 sm:gap-3 border-b border-slate-200 px-3 sm:px-5 py-2.5 sm:py-3 bg-white">
          <Button variant="ghost" size="icon-sm" onClick={prevWeek}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm sm:text-sm font-semibold text-slate-700 min-w-0 flex-1 sm:flex-none sm:min-w-[180px] text-center truncate">
            {weekLabel}
          </span>
          <Button variant="ghost" size="icon-sm" onClick={nextWeek}>
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* grid */}
        <div className="flex flex-1 overflow-x-auto overflow-y-hidden">
          {days.map((day) => {
            const isToday = isSameDay(day, new Date())
            const dateStr = format(day, "yyyy-MM-dd")
            const dayOfWeek = day.getDay()
            const dayEvents = events
              .filter((e) => e.date === dateStr)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex flex-col border-r border-slate-100 last:border-r-0",
                  isToday
                    ? "min-w-[180px] sm:min-w-0 today-column-highlight"
                    : "min-w-[120px] sm:min-w-0",
                )}
                style={{ flex: isToday ? "1.6" : "1" }}
              >
                <div
                  className={cn(
                    "px-2 py-2.5 sm:py-3 border-b",
                    isToday
                      ? "bg-blue-50/50 border-blue-100"
                      : "border-slate-100",
                  )}
                >
                  <p className={cn(
                    "text-sm font-medium tracking-wider",
                    isToday ? "text-blue-600" : "text-slate-400",
                  )}>
                    {WEEKDAY_LABELS_MAP[dayOfWeek]}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p
                      className={cn(
                        "font-bold",
                        isToday
                          ? "text-2xl sm:text-3xl text-blue-600"
                          : "text-lg sm:text-xl text-slate-700",
                      )}
                    >
                      {format(day, "d")}
                    </p>
                    {isToday && (
                      <span className="text-[10px] font-semibold text-blue-500 bg-blue-100 rounded-full px-2 py-0.5 uppercase tracking-wider">
                        今天
                      </span>
                    )}
                  </div>
                </div>

                <div className={cn(
                  "flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-1.5",
                  isToday ? "bg-transparent" : "bg-slate-50/30",
                )}>
                  <StackedEventCards
                    events={dayEvents}
                    onEventClick={openFloating}
                    floatingEventIds={floatingEventIds}
                    streamingEventId={streamingEventId}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
