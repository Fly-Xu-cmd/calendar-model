import { useState, useEffect, useCallback, useRef } from "react"
import {
  format,
  isSameDay,
  getHours,
  getMinutes,
  differenceInMinutes,
  setHours,
  setMinutes,
  addMinutes,
} from "date-fns"
import { cn } from "@/lib/utils"
import { useCalendarStore } from "@/stores/calendarStore"
import type { CalendarEvent } from "@/types"
import { EventBlock } from "./EventBlock"
import { CreateEventDialog } from "./CreateEventDialog"

export const HOUR_HEIGHT = 60
export const START_HOUR = 0
export const END_HOUR = 24
export const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

export function getEventPosition(event: CalendarEvent) {
  const startHour = getHours(event.startTime)
  const startMinute = getMinutes(event.startTime)
  const duration = differenceInMinutes(event.endTime, event.startTime)

  const top = (startHour - START_HOUR) * HOUR_HEIGHT + (startMinute / 60) * HOUR_HEIGHT
  const height = Math.max((duration / 60) * HOUR_HEIGHT, 24)

  return { top, height }
}

function CurrentTimeLine({ days }: { days: Date[] }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const todayIndex = days.findIndex((d) => isSameDay(d, now))
  if (todayIndex === -1) return null

  const hour = getHours(now)
  const minute = getMinutes(now)
  if (hour < START_HOUR || hour >= END_HOUR) return null

  const top = (hour - START_HOUR) * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT
  const colWidth = 100 / days.length

  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{
        top,
        left: `${todayIndex * colWidth}%`,
        width: `${colWidth}%`,
      }}
    >
      <div className="relative flex items-center">
        <div className="size-2 rounded-full bg-red-500 -ml-1" />
        <div className="h-px flex-1 bg-red-500" />
      </div>
    </div>
  )
}

interface TimeGridProps {
  days: Date[]
  events: CalendarEvent[]
}

export function TimeGrid({ days, events }: TimeGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [createSlot, setCreateSlot] = useState<{
    start: Date
    end: Date
  } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const hour = getHours(new Date())
    const scrollTo = Math.max(0, (hour - 1) * HOUR_HEIGHT)
    containerRef.current.scrollTop = scrollTo
  }, [])

  const handleSlotClick = useCallback(
    (day: Date, hour: number, e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const offsetY = e.clientY - rect.top
      const minuteOffset = Math.floor((offsetY / HOUR_HEIGHT) * 60 / 15) * 15

      const startTime = setMinutes(setHours(day, hour), minuteOffset)
      const endTime = addMinutes(startTime, 30)

      setCreateSlot({ start: startTime, end: endTime })
    },
    []
  )

  return (
    <div ref={containerRef} className="flex flex-1 overflow-auto">
      {/* time labels */}
      <div className="w-16 shrink-0 border-r border-border pt-2">
        {HOURS.map((hour, i) => (
          <div
            key={hour}
            className="relative h-[60px] pr-2 text-right text-[11px] text-muted-foreground"
          >
            <span className={cn("absolute right-2", i === 0 ? "top-0" : "-top-2")}>
              {format(new Date(2024, 0, 1, hour % 24), "HH:mm")}
            </span>
          </div>
        ))}
      </div>

      {/* day columns */}
      <div className="relative flex flex-1 pt-2">
        <CurrentTimeLine days={days} />

        {days.map((day) => {
          const dayEvents = events.filter((e) => isSameDay(e.startTime, day))
          const isToday = isSameDay(day, new Date())

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "relative flex-1 border-r border-border last:border-r-0",
                isToday && "bg-primary/[0.03]"
              )}
            >
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={(e) => handleSlotClick(day, hour, e)}
                />
              ))}

              {dayEvents.map((event) => {
                const { top, height } = getEventPosition(event)
                return (
                  <EventBlock
                    key={event.id}
                    event={event}
                    style={{ top, height }}
                  />
                )
              })}
            </div>
          )
        })}
      </div>

      {createSlot && (
        <CreateEventDialog
          initialStart={createSlot.start}
          initialEnd={createSlot.end}
          onClose={() => setCreateSlot(null)}
        />
      )}
    </div>
  )
}
