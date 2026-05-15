import { useState, useRef, useEffect, useMemo } from "react"
import {
  X,
  Check,
  SkipForward,
  Unlock,
  Lock,
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Circle,
  Shield,
  Pause,
} from "lucide-react"
import { isAfter, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCalendarStore } from "@/stores/calendarStore"
import { useChatStore } from "@/stores/chatStore"
import { SkillHashGlyph } from "./SkillHashGlyph"
import type { EmailDraft, ChatMessage, BuildPhase } from "@/types"

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-slate-800">
              {part.slice(2, -2)}
            </strong>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function EmailRow({ draft, eventId }: { draft: EmailDraft; eventId: string }) {
  const toggle = useCalendarStore((s) => s.toggleEmailSelected)
  return (
    <button
      onClick={() => toggle(eventId, draft.id)}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors text-[13px]",
        draft.selected ? "bg-white/50" : "opacity-40",
      )}
    >
      <div className={cn(
        "flex size-3.5 shrink-0 items-center justify-center rounded border",
        draft.selected ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300",
      )}>
        {draft.selected && <Check className="size-2" />}
      </div>
      <span className="text-slate-600 truncate">{draft.to}</span>
      <span className="text-slate-400 truncate flex-1">— {draft.subject}</span>
    </button>
  )
}

function SummaryTab({ eventId }: { eventId: string }) {
  const events = useCalendarStore((s) => s.events)
  const streamingEventId = useCalendarStore((s) => s.streamingEventId)
  const [emailsOpen, setEmailsOpen] = useState(false)

  const event = events.find((e) => e.id === eventId)
  if (!event) return null

  const ai = event.aiContent
  const isStreaming = streamingEventId === event.id

  if (!ai) {
    return (
      <div className="px-4 py-4">
        <p className="text-[13px] text-slate-400">{event.description ?? "无更多详情"}</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 space-y-3">
      {(ai.marketOverview || isStreaming) && (
        <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1.5">运行结果</p>
          {ai.marketOverview && (
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {ai.marketOverview}
              {isStreaming && !ai.medianPrice && <span className="animate-pulse text-blue-400">|</span>}
            </p>
          )}
          {ai.medianPrice && (
            <p className="text-[13px] text-slate-700 leading-relaxed mt-1">
              中位价 <strong>{ai.medianPrice}</strong>
              <span className="ml-1 text-slate-500">（周环比{ai.priceChange}）</span>
              ，库存 <strong>{ai.inventory}</strong> 套
              {ai.newListings > 0 && <>，新增 <strong>{ai.newListings}</strong> 套</>}
            </p>
          )}
        </div>
      )}

      {ai.listings.length > 0 && (
        <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1.5">新房源</p>
          <div className="space-y-0.5">
            {ai.listings.map((l) => (
              <div key={l.address} className="flex items-baseline justify-between text-[13px] py-0.5">
                <span className="text-slate-700">{l.address}</span>
                <span className="text-slate-400 text-[11px] ml-2 shrink-0">
                  {l.price} · {l.beds}bd/{l.baths}ba
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(ai.linkedinDraft || (isStreaming && ai.medianPrice)) && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5">
          <p className="text-[11px] text-blue-400 uppercase tracking-wider font-medium mb-1.5">LinkedIn 草稿</p>
          <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line">
            {ai.linkedinDraft}
            {isStreaming && ai.linkedinDraft && ai.emailDrafts.length === 0 && (
              <span className="animate-pulse text-blue-400">|</span>
            )}
          </p>
        </div>
      )}

      {ai.emailDrafts.length > 0 && (
        <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
          <button
            onClick={() => setEmailsOpen(!emailsOpen)}
            className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider font-medium"
          >
            {emailsOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
            {ai.emailDrafts.length} 封邮件草稿
          </button>
          {emailsOpen && (
            <div className="mt-1.5 space-y-0.5">
              {ai.emailDrafts.map((d) => (
                <EmailRow key={d.id} draft={d} eventId={eventId} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PlanTab({ eventId }: { eventId: string }) {
  const events = useCalendarStore((s) => s.events)
  const event = events.find((e) => e.id === eventId)
  if (!event?.plan) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-[13px] text-slate-400">暂无计划信息</p>
      </div>
    )
  }

  const plan = event.plan

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
        <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1.5">执行计划</p>
        <p className="text-[13px] text-slate-700 font-medium mb-2">
          {plan.schedule}
        </p>
        <div className="space-y-1.5">
          {plan.steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[13px]">
              <span className="flex size-5 shrink-0 items-center justify-center rounded bg-blue-100 text-blue-600 text-[10px] font-bold mt-0.5">
                {idx + 1}
              </span>
              <span className="text-slate-600">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
        <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1.5">筛选条件</p>
        <div className="space-y-1">
          {Object.entries(plan.filters).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">{key}</span>
              <span className="text-slate-700 font-medium">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BuildPhaseItem({ phase, depth = 0 }: { phase: BuildPhase; depth?: number }) {
  const [collapsed, setCollapsed] = useState(true)
  const hasChildren = phase.children && phase.children.length > 0

  const statusIcon = (() => {
    switch (phase.status) {
      case "done": return <CheckCircle2 className="size-3.5 text-green-500 shrink-0" />
      case "running": return <Loader2 className="size-3.5 text-blue-500 animate-spin shrink-0" />
      case "auth-required": return <Shield className="size-3.5 text-amber-500 shrink-0" />
      case "paused": return <Pause className="size-3.5 text-slate-400 shrink-0" />
      case "error": return <Circle className="size-3.5 text-red-400 shrink-0" />
      default: return <Circle className="size-3.5 text-slate-300 shrink-0" />
    }
  })()

  return (
    <div className={cn(depth > 0 && "ml-4 border-l-2 border-slate-100 pl-3")}>
      <button
        onClick={() => hasChildren && setCollapsed(!collapsed)}
        className={cn(
          "flex w-full items-center gap-2 py-1 text-[12px] rounded-lg transition-colors",
          hasChildren && "cursor-pointer hover:bg-slate-50 -mx-1 px-1",
        )}
      >
        {hasChildren ? (
          collapsed ? <ChevronRight className="size-3 text-slate-400 shrink-0" /> : <ChevronDown className="size-3 text-slate-400 shrink-0" />
        ) : <div className="w-3 shrink-0" />}
        {statusIcon}
        <span className={cn(
          "flex-1 text-left",
          phase.status === "done" ? "text-slate-400" : "text-slate-600",
        )}>
          {phase.title}
        </span>
      </button>
      {!collapsed && hasChildren && (
        <div className="mt-0.5">
          {phase.children!.map((c) => <BuildPhaseItem key={c.id} phase={c} depth={depth + 1} />)}
        </div>
      )}
    </div>
  )
}

function BuildTab({ eventId }: { eventId: string }) {
  const events = useCalendarStore((s) => s.events)
  const event = events.find((e) => e.id === eventId)
  const buildPhases = useChatStore((s) => s.buildPhases)

  const phases = event?.buildPhases ?? (buildPhases.length > 0 ? buildPhases : null)

  if (!phases) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-[13px] text-slate-400">暂无构建记录</p>
      </div>
    )
  }

  const doneCount = phases.filter((p) => p.status === "done").length
  const total = phases.length

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">构建过程</p>
          <span className="text-[11px] text-slate-400">{doneCount}/{total}</span>
        </div>
        <div className="h-1 rounded-full bg-slate-200 overflow-hidden mb-2.5">
          <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.round((doneCount / total) * 100)}%` }} />
        </div>
        <div className="space-y-0">
          {phases.map((p) => <BuildPhaseItem key={p.id} phase={p} />)}
        </div>
      </div>
    </div>
  )
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-slate-800 text-white px-3 py-2">
          <p className="text-[13px] leading-relaxed whitespace-pre-line">{msg.content}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
      <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-line">
        <RichText text={msg.content} />
      </p>
    </div>
  )
}

function ChatTab() {
  const messages = useChatStore((s) => s.messages)
  const isTyping = useChatStore((s) => s.isTyping)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <p className="text-[13px]">暂无对话记录</p>
        <p className="text-[11px] mt-1 text-slate-300">在下方输入框提问即可开始</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 space-y-2.5">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} msg={msg} />
      ))}
      {isTyping && (
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </span>
          <span className="text-[13px] text-slate-400">正在思考…</span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

type TabKey = "summary" | "plan" | "build" | "chat"

function EventFloatingPanelItem({
  eventId,
  onClose,
}: {
  eventId: string
  onClose: (id: string) => void
}) {
  const events = useCalendarStore((s) => s.events)
  const confirmEvent = useCalendarStore((s) => s.confirmEvent)
  const skipEvent = useCalendarStore((s) => s.skipEvent)
  const trustMode = useCalendarStore((s) => s.trustMode)
  const setTrustMode = useCalendarStore((s) => s.setTrustMode)
  const streamingEventId = useCalendarStore((s) => s.streamingEventId)
  const messages = useChatStore((s) => s.messages)

  const event = useMemo(
    () => events.find((e) => e.id === eventId),
    [events, eventId],
  )

  const isFutureEvent = useMemo(() => {
    if (!event) return false
    const eventDate = new Date(event.date)
    const today = new Date()
    return isAfter(eventDate, today) && !isSameDay(eventDate, today)
  }, [event])

  const [activeTab, setActiveTab] = useState<TabKey>(isFutureEvent ? "plan" : "summary")

  useEffect(() => {
    setActiveTab(isFutureEvent ? "plan" : "summary")
  }, [isFutureEvent, eventId])

  const chatCount = messages.length

  if (!event) return null

  const ai = event.aiContent
  const isDraft = event.status === "draft"
  const isActioned = event.status === "confirmed" || event.status === "auto-published" || event.status === "skipped"
  const isStreaming = streamingEventId === event.id

  const tabs: { key: TabKey; label: string; show: boolean }[] = [
    { key: "summary", label: "结果", show: !isFutureEvent },
    { key: "plan", label: "计划", show: true },
    { key: "build", label: "构建", show: !isFutureEvent },
    { key: "chat", label: "对话", show: !isFutureEvent },
  ]

  const visibleTabs = tabs.filter((t) => t.show)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col max-h-[60vh]">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <SkillHashGlyph seedText={event.id} size={24} />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-800 truncate">{event.title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {isStreaming ? (
                <span className="flex items-center gap-1 text-[11px] text-blue-500 font-medium">
                  <Loader2 className="size-2.5 animate-spin" /> 生成中
                </span>
              ) : isFutureEvent ? (
                <span className="text-[11px] text-slate-400 italic">计划中</span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  {event.startTime && `${event.startTime} · `}
                  {event.status === "confirmed" && "已发布"}
                  {event.status === "auto-published" && "已自动发布"}
                  {event.status === "skipped" && "已跳过"}
                  {event.status === "draft" && "待确认"}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onClose(event.id)}
          className="rounded-md p-1 text-slate-400 hover:text-slate-600 hover:bg-white/40 transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* tabs */}
      <div className="flex shrink-0 border-b border-slate-100 px-4">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "relative px-3 py-2 text-[12px] font-medium transition-colors flex items-center gap-1.5",
              activeTab === tab.key ? "text-slate-800" : "text-slate-400 hover:text-slate-600",
            )}
          >
            {tab.label}
            {tab.key === "chat" && chatCount > 0 && (
              <span className={cn(
                "text-[10px] rounded-full px-1.5 py-0.5 leading-none",
                activeTab === "chat" ? "bg-slate-800 text-white" : "bg-slate-200/80 text-slate-500",
              )}>
                {chatCount}
              </span>
            )}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-slate-800" />
            )}
          </button>
        ))}
      </div>

      {/* tab content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === "summary" && <SummaryTab eventId={event.id} />}
        {activeTab === "plan" && <PlanTab eventId={event.id} />}
        {activeTab === "build" && <BuildTab eventId={event.id} />}
        {activeTab === "chat" && <ChatTab />}
      </div>

      {/* action buttons (only on summary tab, not for future events) */}
      {activeTab === "summary" && ai && !isStreaming && !isFutureEvent && (
        <div className="shrink-0 border-t border-slate-100 px-4 py-2.5 space-y-2">
          {isDraft && (
            <div className="flex gap-2">
              <Button
                onClick={() => confirmEvent(event.id)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg h-8 text-[12px]"
              >
                <Check className="size-3 mr-1" /> 确认发布
              </Button>
              <Button
                variant="outline"
                onClick={() => skipEvent(event.id)}
                className="rounded-lg h-8 text-[12px] px-3"
              >
                <SkipForward className="size-3 mr-1" /> 跳过
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            {isDraft && trustMode === "confirm" && (
              <button
                onClick={() => setTrustMode("auto")}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Unlock className="size-3" /> 以后不用确认，直接发
              </button>
            )}
            {trustMode === "auto" && (
              <button
                onClick={() => setTrustMode("confirm")}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Lock className="size-3" /> 改回需要确认
              </button>
            )}
            {isActioned && trustMode === "confirm" && (
              <span className="text-[11px] text-slate-300">
                {event.status === "confirmed" && "已确认发布"}
                {event.status === "skipped" && "已跳过本日"}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function EventFloatingPanel() {
  const floatingEventIds = useCalendarStore((s) => s.floatingEventIds)
  const closeFloating = useCalendarStore((s) => s.closeFloating)
  const openFloating = useCalendarStore((s) => s.openFloating)
  const events = useCalendarStore((s) => s.events)

  if (floatingEventIds.length === 0) return null

  const count = floatingEventIds.length

  return (
    <div className="relative" style={{ paddingTop: count > 1 ? `${(count - 1) * 32}px` : undefined }}>
      {floatingEventIds.map((id, idx) => {
        const isTop = idx === count - 1
        const event = events.find((e) => e.id === id)
        const shortTitle = event
          ? event.title.length > 16 ? event.title.slice(0, 16) + "…" : event.title
          : id

        if (!isTop) {
          return (
            <div
              key={id}
              className="absolute left-0 right-0 transition-all duration-300 ease-out"
              style={{
                top: `${idx * 32}px`,
                zIndex: idx + 1,
                transform: `scale(${1 - (count - 1 - idx) * 0.02})`,
              }}
            >
              <div
                onClick={() => openFloating(id)}
                className="flex items-center justify-between rounded-t-2xl border border-b-0 border-slate-200 bg-slate-50 px-4 py-2 cursor-pointer hover:bg-slate-100 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <SkillHashGlyph seedText={id} size={18} />
                  <span className="text-[12px] font-medium text-slate-600 truncate">{shortTitle}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); closeFloating(id) }}
                  className="rounded-md p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="size-3" />
                </button>
              </div>
            </div>
          )
        }

        return (
          <div key={id} className="relative card-enter" style={{ zIndex: count }}>
            <EventFloatingPanelItem eventId={id} onClose={closeFloating} />
          </div>
        )
      })}
    </div>
  )
}
