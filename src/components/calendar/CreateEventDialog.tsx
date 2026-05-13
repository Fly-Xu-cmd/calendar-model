import { useState } from "react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { X, Clock, AlignLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useCalendarStore } from "@/stores/calendarStore"
import type { EventStatus } from "@/types"

interface CreateEventDialogProps {
  initialStart: Date
  initialEnd: Date
  onClose: () => void
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120]

const COLOR_OPTIONS = [
  { id: "blue", label: "默认", className: "bg-blue-400" },
  { id: "amber", label: "AI 草稿", className: "bg-amber-400" },
  { id: "green", label: "已完成", className: "bg-green-400" },
  { id: "purple", label: "会议", className: "bg-purple-400" },
  { id: "red", label: "紧急", className: "bg-red-400" },
]

export function CreateEventDialog({
  initialStart,
  initialEnd,
  onClose,
}: CreateEventDialogProps) {
  const addEvent = useCalendarStore((s) => s.addEvent)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startTime] = useState(initialStart)
  const [duration, setDuration] = useState(
    Math.round((initialEnd.getTime() - initialStart.getTime()) / 60000)
  )
  const [color, setColor] = useState("blue")
  const [showDesc, setShowDesc] = useState(false)

  const endTime = new Date(startTime.getTime() + duration * 60000)

  const handleCreate = () => {
    if (!title.trim()) return

    const status: EventStatus = color === "amber" ? "draft" : "confirmed"

    addEvent({
      id: `evt-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      startTime,
      endTime,
      status,
      color,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="text-sm font-semibold text-foreground">新建事件</h3>
          <Button variant="ghost" size="icon-xs" onClick={onClose}>
            <X className="size-3.5" />
          </Button>
        </div>

        <div className="space-y-4 px-4 pb-4">
          {/* title */}
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate()
              if (e.key === "Escape") onClose()
            }}
            placeholder="事件名称"
            className="w-full border-b border-border bg-transparent py-2 text-base font-medium outline-none placeholder:text-muted-foreground focus:border-primary transition-colors"
          />

          {/* time */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-foreground">
              {format(startTime, "M月d日 EEE HH:mm", { locale: zhCN })}
            </span>
            <span className="text-muted-foreground">–</span>
            <span className="text-foreground">
              {format(endTime, "HH:mm")}
            </span>
          </div>

          {/* duration picker */}
          <div className="flex flex-wrap gap-1.5">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  duration === d
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {d < 60 ? `${d}分钟` : `${d / 60}小时`}
              </button>
            ))}
          </div>

          {/* color / type */}
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">标签</p>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                    color === c.id
                      ? "border-foreground/30 bg-accent font-medium text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-muted"
                  )}
                >
                  <span className={cn("size-2.5 rounded-full", c.className)} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* description toggle */}
          {!showDesc ? (
            <button
              onClick={() => setShowDesc(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <AlignLeft className="size-3.5" />
              添加描述
            </button>
          ) : (
            <textarea
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="事件描述（可选）"
              rows={3}
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring resize-y placeholder:text-muted-foreground"
            />
          )}
        </div>

        <Separator />

        {/* actions */}
        <div className="flex justify-end gap-2 p-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button size="sm" onClick={handleCreate} disabled={!title.trim()}>
            创建
          </Button>
        </div>
      </div>
    </div>
  )
}
