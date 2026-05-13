import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns"
import { zhCN } from "date-fns/locale"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCalendarStore } from "@/stores/calendarStore"

const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"]

export function MiniCalendar() {
  const { currentDate, setCurrentDate } = useCalendarStore()
  const [viewMonth, setViewMonth] = useState(currentDate)

  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let day = calStart
  while (day <= calEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const handleDayClick = (d: Date) => {
    setCurrentDate(d)
  }

  return (
    <div className="space-y-2">
      {/* month nav */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setViewMonth(subMonths(viewMonth, 1))}
        >
          <ChevronLeft className="size-3.5" />
        </Button>
        <span className="text-xs font-medium">
          {format(viewMonth, "yyyy年M月", { locale: zhCN })}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </div>

      {/* weekday header */}
      <div className="grid grid-cols-7 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1 text-[10px] text-muted-foreground">
            {label}
          </div>
        ))}
      </div>

      {/* days */}
      <div className="grid grid-cols-7 text-center">
        {days.map((d) => {
          const isCurrentMonth = isSameMonth(d, viewMonth)
          const isToday = isSameDay(d, new Date())
          const isSelected = isSameDay(d, currentDate)

          return (
            <button
              key={d.toISOString()}
              onClick={() => handleDayClick(d)}
              className={cn(
                "mx-auto flex size-7 items-center justify-center rounded-full text-[11px] transition-colors",
                !isCurrentMonth && "text-muted-foreground/40",
                isCurrentMonth && !isToday && !isSelected && "text-foreground hover:bg-muted",
                isToday && !isSelected && "bg-primary/10 text-primary font-semibold",
                isSelected && "bg-primary text-primary-foreground font-semibold"
              )}
            >
              {format(d, "d")}
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
