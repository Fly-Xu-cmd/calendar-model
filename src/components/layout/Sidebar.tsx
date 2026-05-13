import {
  Calendar,
  CheckSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCalendarStore, type NavSection } from "@/stores/calendarStore"
import { UserPanel } from "./UserPanel"
import { MiniCalendar } from "./MiniCalendar"
import type { CalendarViewMode } from "@/types"

const navItems = [
  { id: "calendar", label: "日历", icon: Calendar },
  { id: "tasks", label: "任务", icon: CheckSquare },
  { id: "settings", label: "偏好设置", icon: Settings },
] as const

const viewModes: { id: CalendarViewMode; label: string }[] = [
  { id: "day", label: "日" },
  { id: "week", label: "周" },
  { id: "month", label: "月" },
]

export function Sidebar() {
  const {
    viewMode,
    sidebarCollapsed,
    activeNav,
    setViewMode,
    toggleSidebar,
    setActiveNav,
  } = useCalendarStore()

  const isActive = (id: string) => activeNav === id

  if (sidebarCollapsed) {
    return (
      <div className="flex w-12 shrink-0 flex-col items-center border-r border-border bg-muted/30 py-3">
        <Button variant="ghost" size="icon-sm" onClick={toggleSidebar}>
          <ChevronRight className="size-4" />
        </Button>
        <Separator className="my-2 w-6" />
        {navItems.map(({ id, icon: Icon }) => (
          <Button
            key={id}
            variant={isActive(id) ? "secondary" : "ghost"}
            size="icon-sm"
            className="mt-1"
            title={id}
            onClick={() => setActiveNav(id as NavSection)}
          >
            <Icon className="size-4" />
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex w-60 shrink-0 flex-col border-r border-border bg-muted/30">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-sm font-semibold text-foreground">📅 日历助理</h1>
        <Button variant="ghost" size="icon-sm" onClick={toggleSidebar}>
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      <Separator />

      {/* navigation */}
      <nav className="space-y-0.5 px-2 py-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveNav(id as NavSection)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive(id)
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>

      <Separator className="mx-4" />

      {/* mini calendar */}
      <div className="px-3 py-3">
        <MiniCalendar />
      </div>

      <Separator className="mx-4" />

      {/* view mode */}
      <div className="px-4 py-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          视图模式
        </p>
        <div className="flex gap-1 rounded-lg border border-border bg-background p-0.5">
          {viewModes.map((m) => (
            <button
              key={m.id}
              onClick={() => setViewMode(m.id)}
              className={cn(
                "flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                viewMode === m.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* spacer */}
      <div className="flex-1" />

      {/* user panel */}
      <div className="border-t border-border px-3 py-3">
        <UserPanel />
      </div>
    </div>
  )
}
