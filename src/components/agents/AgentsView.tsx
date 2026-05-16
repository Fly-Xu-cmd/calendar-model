import { useMemo } from "react"
import {
  Plus,
  CalendarDays,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Bot,
  Clock,
  MessageSquare,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/stores/chatStore"
import { useCalendarStore } from "@/stores/calendarStore"
import { SkillHashGlyph } from "@/components/calendar/SkillHashGlyph"
import type { CalendarEvent, ChatSession } from "@/types"

type AgentStatus =
  | "building"
  | "needs-attention"
  | "draft-ready"
  | "running"
  | "configured"
  | "configuring"
  | "idle"

interface AgentItem {
  id: string
  session: ChatSession | null
  events: CalendarEvent[]
  primaryEvent: CalendarEvent | null
  name: string
  seedText: string
  status: AgentStatus
  statusLabel: string
  description: string
  createdAt: Date
  lastUpdated: Date
  messageCount: number
}

function deriveStatus(
  session: ChatSession | null,
  events: CalendarEvent[],
  isBuilding: boolean,
  hasPendingAuth: boolean,
): { status: AgentStatus; label: string } {
  if (hasPendingAuth) return { status: "needs-attention", label: "需要授权" }

  const failed = events.find((e) => e.status === "failed")
  if (failed) return { status: "needs-attention", label: "运行失败" }

  if (isBuilding) return { status: "building", label: "构建中" }

  const loading = events.find((e) => e.status === "loading")
  if (loading) return { status: "building", label: "准备中" }

  const draftReady = events.find(
    (e) => e.status === "draft" && e.aiContent?.marketOverview,
  )
  if (draftReady) return { status: "draft-ready", label: "待确认" }

  const running = events.find(
    (e) => e.status === "confirmed" || e.status === "auto-published",
  )
  if (running) return { status: "running", label: "已发布" }

  if (events.length > 0) return { status: "configured", label: "已配置" }

  if (session && session.step > 0) return { status: "configuring", label: "配置中" }

  return { status: "idle", label: "待启动" }
}

function StatusDot({ status }: { status: AgentStatus }) {
  const colorMap: Record<AgentStatus, string> = {
    building: "bg-blue-500",
    "needs-attention": "bg-amber-500",
    "draft-ready": "bg-violet-500",
    running: "bg-emerald-500",
    configured: "bg-slate-400",
    configuring: "bg-sky-500",
    idle: "bg-slate-300",
  }
  const pulse = status === "building" || status === "needs-attention"
  return (
    <span className="relative flex size-1.5 shrink-0">
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            colorMap[status],
          )}
        />
      )}
      <span className={cn("relative inline-flex size-1.5 rounded-full", colorMap[status])} />
    </span>
  )
}

function StatusBadge({
  status,
  label,
}: {
  status: AgentStatus
  label: string
}) {
  const styles: Record<AgentStatus, string> = {
    building: "bg-blue-50 text-blue-600",
    "needs-attention": "bg-amber-50 text-amber-600",
    "draft-ready": "bg-violet-50 text-violet-600",
    running: "bg-emerald-50 text-emerald-600",
    configured: "bg-slate-100 text-slate-500",
    configuring: "bg-sky-50 text-sky-600",
    idle: "bg-slate-100 text-slate-400",
  }
  const Icon = (() => {
    switch (status) {
      case "building":
        return Loader2
      case "needs-attention":
        return ShieldAlert
      case "draft-ready":
        return Sparkles
      case "running":
        return CheckCircle2
      default:
        return null
    }
  })()
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
        styles[status],
      )}
    >
      {Icon && (
        <Icon
          className={cn("size-2.5", status === "building" && "animate-spin")}
          strokeWidth={2.4}
        />
      )}
      {label}
    </span>
  )
}

function AgentRow({
  item,
  onOpen,
}: {
  item: AgentItem
  onOpen: () => void
}) {
  const upcomingCount = item.events.filter(
    (e) => e.status === "draft" || e.status === "loading",
  ).length
  const publishedCount = item.events.filter(
    (e) => e.status === "confirmed" || e.status === "auto-published",
  ).length

  return (
    <button
      onClick={onOpen}
      className="group flex w-full items-center gap-3 border-b border-slate-100 px-6 py-3 text-left transition-colors last:border-b-0 hover:bg-slate-50/70"
    >
      <StatusDot status={item.status} />

      <SkillHashGlyph seedText={item.seedText} size={32} />

      <div className="flex min-w-0 flex-[2] flex-col">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-semibold text-slate-800">
            {item.name}
          </span>
          <StatusBadge status={item.status} label={item.statusLabel} />
        </div>
        <p className="mt-0.5 truncate text-[12px] text-slate-500">
          {item.description}
        </p>
      </div>

      <div className="hidden flex-1 items-center gap-3 text-[11px] text-slate-400 md:flex">
        <span className="flex items-center gap-1">
          <CalendarDays className="size-3" />
          {item.events.length}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="size-3" />
          {item.messageCount}
        </span>
        {upcomingCount > 0 && (
          <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-600">
            待确认 {upcomingCount}
          </span>
        )}
        {publishedCount > 0 && (
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
            已发布 {publishedCount}
          </span>
        )}
      </div>

      <div className="hidden w-[120px] shrink-0 items-center gap-1 text-[11px] text-slate-400 lg:flex">
        <Clock className="size-3" />
        {formatDistanceToNow(item.lastUpdated, { addSuffix: true, locale: zhCN })}
      </div>

      <ChevronRight className="size-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500" />
    </button>
  )
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
        <Bot className="size-7 text-slate-400" strokeWidth={1.8} />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-slate-700">
        还没有 Agent
      </h3>
      <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-slate-400">
        点击右上角「新建」或在对话面板描述你想自动化的工作，即可创建 Agent。
      </p>
    </div>
  )
}

export function AgentsView() {
  const sessions = useChatStore((s) => s.sessions)
  const switchSession = useChatStore((s) => s.switchSession)
  const createSession = useChatStore((s) => s.createSession)
  const activeBuilds = useChatStore((s) => s.activeBuilds)
  const pendingAuth = useChatStore((s) => s.pendingAuth)
  const events = useCalendarStore((s) => s.events)
  const openFloating = useCalendarStore((s) => s.openFloating)


  const agents = useMemo<AgentItem[]>(() => {
    const sessionList = Object.values(sessions)
    const sessionMap = new Map(sessionList.map((s) => [s.id, s]))
    const handled = new Set<string>()
    const items: AgentItem[] = []

    sessionList.forEach((session) => {
      const linkedEvents = events.filter(
        (e) => e.isAiGenerated && e.chatSessionId === session.id,
      )
      linkedEvents.forEach((e) => handled.add(e.id))
      const primary = linkedEvents[0] ?? null
      const isBuilding = linkedEvents.some((e) => !!activeBuilds[e.id])
      const hasPendingAuth = linkedEvents.some(
        (e) => pendingAuth?.eventId === e.id,
      )
      const { status, label } = deriveStatus(
        session,
        linkedEvents,
        isBuilding,
        hasPendingAuth,
      )

      const name = primary?.title
        ? primary.title.replace(/\s*[✅⚠️]\s*$/u, "").trim()
        : session.title ?? (session.step > 0 ? "配置中的 Agent" : "新 Agent")

      const description = (() => {
        if (primary?.aiContent?.marketOverview) {
          return primary.aiContent.marketOverview
        }
        if (primary?.plan?.steps?.length) {
          return primary.plan.steps[0]
        }
        const lastMsg = [...session.messages]
          .reverse()
          .find((m) => m.role === "barrage" || m.role === "user")
        if (lastMsg) {
          return lastMsg.content.replace(/\*\*/g, "").slice(0, 80)
        }
        return "尚未开始配置"
      })()

      const lastUpdated = (() => {
        const lastMsg = session.messages[session.messages.length - 1]
        if (lastMsg) return new Date(lastMsg.timestamp)
        return new Date(session.createdAt)
      })()

      items.push({
        id: session.id,
        session,
        events: linkedEvents,
        primaryEvent: primary,
        name,
        seedText: primary?.id ?? `agent-${session.id}`,
        status,
        statusLabel: label,
        description,
        createdAt: new Date(session.createdAt),
        lastUpdated,
        messageCount: session.messages.length,
      })
    })

    events
      .filter((e) => e.isAiGenerated && !handled.has(e.id))
      .forEach((event) => {
        const sessionId = event.chatSessionId
        const session = sessionId ? sessionMap.get(sessionId) ?? null : null
        if (sessionId && session && handled.has(event.id)) return

        const linkedEvents = [event]
        const isBuilding = !!activeBuilds[event.id]
        const hasPendingAuth = pendingAuth?.eventId === event.id
        const { status, label } = deriveStatus(
          session,
          linkedEvents,
          isBuilding,
          hasPendingAuth,
        )
        const name = event.title.replace(/\s*[✅⚠️]\s*$/u, "").trim()
        const description =
          event.aiContent?.marketOverview ??
          event.plan?.steps?.[0] ??
          "AI 生成的日程"

        items.push({
          id: event.id,
          session: null,
          events: linkedEvents,
          primaryEvent: event,
          name,
          seedText: event.id,
          status,
          statusLabel: label,
          description,
          createdAt: new Date(),
          lastUpdated: new Date(),
          messageCount: 0,
        })
      })

    return items.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
  }, [sessions, events, activeBuilds, pendingAuth])

  const handleOpenAgent = (item: AgentItem) => {
    if (item.session) {
      switchSession(item.session.id)
    }
    if (item.primaryEvent) {
      openFloating(item.primaryEvent.id)
    }
  }

  const handleCreate = () => {
    createSession()
  }

  const counts = useMemo(() => {
    return {
      total: agents.length,
      active: agents.filter(
        (a) =>
          a.status === "running" ||
          a.status === "draft-ready" ||
          a.status === "building",
      ).length,
      attention: agents.filter((a) => a.status === "needs-attention").length,
    }
  }, [agents])

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-semibold tracking-tight text-slate-800">
            Agents
          </h2>
          {agents.length > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-100 px-1.5 text-[11px] font-semibold text-slate-500">
              {agents.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          {agents.length > 0 && (
            <>
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                运行 {counts.active}
              </span>
              {counts.attention > 0 && (
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  待处理 {counts.attention}
                </span>
              )}
            </>
          )}
          <button
            onClick={handleCreate}
            className="ml-2 inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            <Plus className="size-3" strokeWidth={2.5} />
            新建
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {agents.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-white">
            {agents.map((item) => (
              <AgentRow
                key={item.id}
                item={item}
                onOpen={() => handleOpenAgent(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
