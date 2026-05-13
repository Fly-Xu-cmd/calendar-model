import { useState } from "react"
import {
  format,
  addDays,
  subDays,
  isSameDay,
  startOfWeek,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  isSameMonth,
} from "date-fns"
import { zhCN } from "date-fns/locale"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCalendarStore } from "@/stores/calendarStore"
import type { CalendarEvent } from "@/types"

const colorMap: Record<string, string> = {
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  green: "bg-emerald-500",
  purple: "bg-purple-500",
  red: "bg-red-500",
}

const colorBg: Record<string, string> = {
  blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  amber: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  green: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
  purple: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
  red: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
}

function EventCard({ event }: { event: CalendarEvent }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={cn(
        "w-full text-left rounded-xl border p-4 transition-all",
        colorBg[event.color],
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", colorMap[event.color])} />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-foreground leading-snug">
            {event.title}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3" />
            <span>{event.startTime} – {event.endTime}</span>
          </div>
          {expanded && event.description && (
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          )}
          {event.tags && event.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] gap-0.5">
                  <Tag className="size-2.5" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"]

function MiniCalendar() {
  const { currentDate, setCurrentDate } = useCalendarStore()
  const [viewMonth, setViewMonth] = useState(currentDate)

  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let d = calStart
  while (d <= calEnd) {
    days.push(d)
    d = addDays(d, 1)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon-sm" onClick={() => setViewMonth(subMonths(viewMonth, 1))}>
          <ChevronLeft className="size-3.5" />
        </Button>
        <span className="text-sm font-semibold">
          {format(viewMonth, "yyyy年M月", { locale: zhCN })}
        </span>
        <Button variant="ghost" size="icon-sm" onClick={() => setViewMonth(addMonths(viewMonth, 1))}>
          <ChevronRight className="size-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 text-center">
        {WEEKDAY_LABELS.map((l) => (
          <div key={l} className="py-1 text-[11px] text-muted-foreground font-medium">{l}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center gap-y-0.5">
        {days.map((day) => {
          const inMonth = isSameMonth(day, viewMonth)
          const isToday = isSameDay(day, new Date())
          const isSelected = isSameDay(day, currentDate)
          return (
            <button
              key={day.toISOString()}
              onClick={() => setCurrentDate(day)}
              className={cn(
                "mx-auto flex size-8 items-center justify-center rounded-full text-xs transition-colors",
                !inMonth && "text-muted-foreground/30",
                inMonth && !isToday && !isSelected && "text-foreground hover:bg-muted",
                isToday && !isSelected && "bg-primary/10 text-primary font-bold",
                isSelected && "bg-primary text-primary-foreground font-bold",
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs"
        onClick={() => {
          setCurrentDate(new Date())
          setViewMonth(new Date())
        }}
      >
        回到今天
      </Button>
    </div>
  )
}

export function CalendarView() {
  const { currentDate, setCurrentDate, events } = useCalendarStore()
  const isToday = isSameDay(currentDate, new Date())

  const dayEvents = events
    .filter((e) => e.date === format(currentDate, "yyyy-MM-dd"))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <div className="flex h-full">
      {/* left: mini calendar */}
      <div className="hidden md:flex w-72 shrink-0 flex-col gap-4 border-r border-border p-5 overflow-y-auto">
        <MiniCalendar />
      </div>

      {/* right: day agenda */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* day header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {format(currentDate, "M月d日 EEEE", { locale: zhCN })}
              </h2>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
              <ChevronRight className="size-4" />
            </Button>
            {isToday && (
              <Badge className="text-[10px]">今天</Badge>
            )}
          </div>
        </div>

        {/* events list */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-xl px-6 py-6 space-y-3">
            {dayEvents.length > 0 ? (
              dayEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <div className="text-4xl mb-3 opacity-30">📅</div>
                <p className="text-sm">今日暂无日程</p>
                <p className="text-xs mt-1 text-muted-foreground/70">
                  可以通过 AI 助手创建日程
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
