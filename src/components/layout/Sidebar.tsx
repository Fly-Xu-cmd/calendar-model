import { useMemo } from "react"
import { CalendarDays, Bot, Sparkles, PanelLeftClose, PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCalendarStore } from "@/stores/calendarStore"
import { useChatStore } from "@/stores/chatStore"
import type { SidebarType } from "@/types"

interface NavItem {
  id: SidebarType
  label: string
  icon: typeof CalendarDays
  description: string
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "calendar",
    label: "日历",
    icon: CalendarDays,
    description: "周视图与日程",
  },
  {
    id: "agents",
    label: "Agents",
    icon: Bot,
    description: "对话中产生的助手",
  },
]

function NavButton({
  item,
  active,
  count,
  collapsed,
  onClick,
}: {
  item: NavItem
  active: boolean
  count?: number
  collapsed: boolean
  onClick: () => void
}) {
  const Icon = item.icon

  if (collapsed) {
    return (
      <button
        onClick={onClick}
        title={item.label}
        className={cn(
          "group relative flex w-full items-center justify-center rounded-lg p-2 transition-all",
          active
            ? "bg-white shadow-sm shadow-slate-200/60 ring-1 ring-slate-200"
            : "hover:bg-white/60",
        )}
      >
        <div
          className={cn(
            "flex size-7 items-center justify-center rounded-lg transition-colors",
            active
              ? "bg-blue-500 text-white shadow-sm shadow-blue-500/30"
              : "text-slate-500 group-hover:text-slate-700",
          )}
        >
          <Icon className="size-4" strokeWidth={2.2} />
        </div>
        {typeof count === "number" && count > 0 && (
          <span
            className={cn(
              "absolute right-1.5 top-1 inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-0.5 text-[9px] font-semibold",
              active
                ? "bg-blue-100 text-blue-600"
                : "bg-slate-200 text-slate-500",
            )}
          >
            {count}
          </span>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
        active
          ? "bg-white shadow-sm shadow-slate-200/60 ring-1 ring-slate-200"
          : "hover:bg-white/60",
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          active
            ? "bg-blue-500 text-white shadow-sm shadow-blue-500/30"
            : "bg-white text-slate-500 ring-1 ring-slate-200 group-hover:text-slate-700",
        )}
      >
        <Icon className="size-4" strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-[13px] font-semibold",
              active ? "text-slate-900" : "text-slate-700",
            )}
          >
            {item.label}
          </span>
          {typeof count === "number" && count > 0 && (
            <span
              className={cn(
                "inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                active
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-200/80 text-slate-500",
              )}
            >
              {count}
            </span>
          )}
        </div>
        <p
          className={cn(
            "mt-0.5 truncate text-[11px]",
            active ? "text-slate-500" : "text-slate-400",
          )}
        >
          {item.description}
        </p>
      </div>
    </button>
  )
}

export function Sidebar() {
  const sidebarType = useCalendarStore((s) => s.sidebarType)
  const setSidebarType = useCalendarStore((s) => s.setSidebarType)
  const collapsed = useCalendarStore((s) => s.sidebarCollapsed)
  const toggleCollapsed = useCalendarStore((s) => s.toggleSidebarCollapsed)
  const events = useCalendarStore((s) => s.events)
  const sessions = useChatStore((s) => s.sessions)

  const calendarCount = useMemo(
    () => events.filter((e) => !e.isAiGenerated || e.status !== "loading").length,
    [events],
  )

  const agentCount = useMemo(() => {
    const sessionIds = Object.keys(sessions)
    const eventAgentIds = events
      .filter((e) => e.isAiGenerated && e.chatSessionId)
      .map((e) => e.chatSessionId as string)
    return new Set([...sessionIds, ...eventAgentIds]).size
  }, [sessions, events])

  const ToggleIcon = collapsed ? PanelLeft : PanelLeftClose

  if (collapsed) {
    return (
      <aside className="flex h-full w-[52px] shrink-0 flex-col items-center border-r border-slate-200 bg-slate-50/80 py-3 backdrop-blur transition-[width] duration-200">
        <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 shadow-sm">
          <Sparkles className="size-3.5 text-white" strokeWidth={2.4} />
        </div>

        <div className="mt-4 w-full space-y-1 px-1.5">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={sidebarType === item.id}
              count={item.id === "calendar" ? calendarCount : agentCount}
              collapsed
              onClick={() => setSidebarType(item.id)}
            />
          ))}
        </div>

        <button
          onClick={toggleCollapsed}
          className="mt-auto flex size-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/60 hover:text-slate-600"
          title="展开侧栏"
        >
          <ToggleIcon className="size-3.5" strokeWidth={2} />
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/80 backdrop-blur transition-[width] duration-200">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 shadow-sm">
            <Sparkles className="size-3.5 text-white" strokeWidth={2.4} />
          </div>
          <span className="text-[13px] font-semibold tracking-tight text-slate-800">
            Workspace
          </span>
        </div>
        <button
          onClick={toggleCollapsed}
          className="flex size-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/60 hover:text-slate-600"
          title="收起侧栏"
        >
          <ToggleIcon className="size-3.5" strokeWidth={2} />
        </button>
      </div>

      <div className="px-3 pb-2">
        <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          视图
        </p>
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={sidebarType === item.id}
              count={item.id === "calendar" ? calendarCount : agentCount}
              collapsed={false}
              onClick={() => setSidebarType(item.id)}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto px-4 pb-4 pt-3">
        <div className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5">
          <p className="text-[11px] font-medium text-slate-600">提示</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
            在 Agents 视图统一管理日历与对话过程中创建的智能体。
          </p>
        </div>
      </div>
    </aside>
  )
}
