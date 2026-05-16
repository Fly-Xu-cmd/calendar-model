import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import {
  ArrowUp,
  X,
  Pencil,
  CornerDownLeft,
  Send,
  Shield,
  Globe,
  Zap,
  ClipboardList,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/stores/chatStore"
import { useCalendarStore } from "@/stores/calendarStore"
import { SkillHashGlyph } from "@/components/calendar/SkillHashGlyph"
import { EventFloatingPanel } from "@/components/calendar/EventFloatingPanel"
import type { ChatAction, ChatMessage } from "@/types"

const AGENT_LIST = [
  { id: "ai-assistant", name: "助理", seedText: "ai-assistant", label: "随时吩咐" },
  { id: "builder-agent", name: "构建", seedText: "builder-agent", label: "正在构建" },
  { id: "style-agent", name: "风格分析", seedText: "style-agent", label: "分析风格中" },
  { id: "filter-agent", name: "数据筛选", seedText: "filter-agent", label: "正在筛选" },
  { id: "scheduler-agent", name: "任务调度", seedText: "scheduler-agent", label: "安排任务中" },
]

function useCurrentAgent() {
  const events = useCalendarStore((s) => s.events)
  const buildPhases = useChatStore((s) => s.buildPhases)
  const isTyping = useChatStore((s) => s.isTyping)
  const activeSessionId = useChatStore((s) => s.activeSessionId)

  return useMemo(() => {
    const buildingEvent = activeSessionId
      ? events.find((e) => e.isAiGenerated && e.chatSessionId === activeSessionId)
      : null
    const isBuilding = buildPhases.length > 0 && buildPhases.some((p) => p.status === "running" || p.status === "auth-required")

    if (buildingEvent) {
      const shortTitle = buildingEvent.title.length > 8 ? buildingEvent.title.slice(0, 8) + "…" : buildingEvent.title
      return {
        id: buildingEvent.id,
        name: shortTitle || "Agent",
        seedText: buildingEvent.id,
        label: isBuilding ? "构建中" : "执行中",
      }
    }

    return AGENT_LIST[0]
  }, [events, buildPhases, isTyping, activeSessionId])
}

function AgentBar() {
  const events = useCalendarStore((s) => s.events)
  const openFloating = useCalendarStore((s) => s.openFloating)
  const floatingEventIds = useCalendarStore((s) => s.floatingEventIds)
  const streamingEventId = useCalendarStore((s) => s.streamingEventId)
  const activeBuilds = useChatStore((s) => s.activeBuilds)
  const pendingAuth = useChatStore((s) => s.pendingAuth)
  const focusBuild = useChatStore((s) => s.focusBuild)

  const aiEvents = useMemo(
    () => events.filter((e) => {
      if (!e.isAiGenerated) return false
      const done = e.status === "confirmed" || e.status === "auto-published" || e.status === "skipped"
      if (done) return false
      if (!!activeBuilds[e.id]) return true
      if (streamingEventId === e.id) return true
      if (e.status === "loading") return true
      if (e.status === "failed") return true
      if (e.status === "draft") return true
      if (pendingAuth?.eventId === e.id) return true
      return false
    }),
    [events, activeBuilds, streamingEventId, pendingAuth],
  )

  if (aiEvents.length === 0) return null

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto scrollbar-none">
      {aiEvents.map((event) => {
        const isActive = floatingEventIds.includes(event.id)
        const isStreaming = streamingEventId === event.id
        const isLoading = event.status === "loading"
        const build = activeBuilds[event.id]
        const isBuildingThis = !!build
        const isFailed = event.status === "failed"
        const needsAttention = pendingAuth?.eventId === event.id || isFailed
        const isDraft = event.status === "draft" && event.aiContent?.marketOverview
        const shortTitle = event.title.length > 12 ? event.title.slice(0, 12) + "…" : event.title

        const handleClick = () => {
          if (needsAttention) {
            focusBuild(event.id)
          } else {
            openFloating(event.id)
          }
        }

        return (
          <button
            key={event.id}
            onClick={handleClick}
            className={cn(
              "relative flex items-center gap-1.5 rounded-full px-2.5 py-1 shrink-0 transition-all",
              isActive
                ? "bg-slate-100 border border-slate-300 shadow-sm"
                : needsAttention
                  ? "bg-amber-50 border border-amber-300"
                  : isBuildingThis || isStreaming || isLoading
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-white/80 border border-slate-200/60 hover:bg-slate-50 hover:border-slate-300",
            )}
          >
            {(isBuildingThis || isStreaming || isLoading) && !needsAttention && (
              <span className="relative flex size-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-1.5 bg-blue-500" />
              </span>
            )}
            {needsAttention && (
              <span className="relative flex size-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-1.5 bg-amber-500" />
              </span>
            )}
            <SkillHashGlyph seedText={event.id} size={14} />
            <span className={cn(
              "text-[11px] font-medium max-w-[80px] truncate",
              isActive ? "text-slate-700"
                : needsAttention ? "text-amber-600"
                  : isBuildingThis || isStreaming ? "text-blue-600"
                    : "text-slate-500",
            )}>
              {shortTitle}
            </span>
            {needsAttention && (
              <span className="absolute -top-1 -right-1 flex size-3 items-center justify-center rounded-full bg-amber-500 text-white text-[8px] font-bold">!</span>
            )}
            {isDraft && !needsAttention && !isBuildingThis && (
              <span className="absolute -top-1 -right-1 flex size-3 items-center justify-center rounded-full bg-blue-500 text-white text-[8px] font-bold">1</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function BarrageMessage({ message }: { message: ChatMessage }) {
  const events = useCalendarStore((s) => s.events)
  const activeSessionId = useChatStore((s) => s.activeSessionId)

  if (message.role === "user") return null

  const RichText = ({ text }: { text: string }) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return (
      <>
        {parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>
          }
          return <span key={i}>{part}</span>
        })}
      </>
    )
  }

  const buildingEvent = activeSessionId
    ? events.find((e) => e.isAiGenerated && e.chatSessionId === activeSessionId)
    : null
  const eventSeedText = buildingEvent?.id ?? (activeSessionId ? `agent-${activeSessionId}` : "ai-assistant")

  const iconComp = (() => {
    if (message.icon === "build") return <Zap className="size-3 text-white/90" />
    if (message.icon === "task") return <ClipboardList className="size-3 text-white/90" />
    if (message.icon === "auth") return <Shield className="size-3 text-white/90" />
    if (message.icon === "domain") return <Globe className="size-3 text-white/90" />
    return null
  })()

  return (
    <div className="barrage-msg flex gap-2 items-start">
      {iconComp ? (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 shadow-sm mt-0.5">
          {iconComp}
        </div>
      ) : (
        <div className="shrink-0 mt-0.5">
          <SkillHashGlyph seedText={eventSeedText} size={24} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-line">
          <RichText text={message.content} />
        </p>
      </div>
    </div>
  )
}

function BarrageStream() {
  const messages = useChatStore((s) => s.messages)
  const isTyping = useChatStore((s) => s.isTyping)
  const currentAgent = useCurrentAgent()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState(false)
  const prevCountRef = useRef(0)

  const barrageMessages = messages.filter((m) => m.role === "barrage" || m.role === "assistant")

  useEffect(() => {
    if (barrageMessages.length > prevCountRef.current) {
      setHidden(false)
    }
    prevCountRef.current = barrageMessages.length
  }, [barrageMessages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  if (barrageMessages.length === 0 && !isTyping) return null
  if (hidden) return null

  return (
    <div className="barrage-container relative max-h-[240px] overflow-y-auto px-3 py-2 space-y-1.5 mask-fade-top">
      <button
        onClick={() => setHidden(true)}
        className="sticky top-0 right-0 z-10 float-right flex size-5 items-center justify-center rounded-full bg-slate-200/80 text-slate-400 hover:bg-slate-300 hover:text-slate-600 transition-colors"
      >
        <X className="size-3" />
      </button>
      {barrageMessages.map((msg) => (
        <BarrageMessage key={msg.id} message={msg} />
      ))}
      {isTyping && (
        <div className="barrage-msg flex items-center gap-2 px-1">
          <SkillHashGlyph seedText={currentAgent.seedText} size={20} />
          <span className="flex items-center gap-1 text-slate-400">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

function OptionButtons({
  actions,
  onSelect,
  onDismiss,
  questionText,
}: {
  actions: ChatAction[]
  onSelect: (label: string) => void
  onDismiss: () => void
  questionText?: string
}) {
  const currentAgent = useCurrentAgent()
  const [activeIdx, setActiveIdx] = useState(0)
  const [otherValue, setOtherValue] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveIdx(0)
    setOtherValue("")
    containerRef.current?.focus()
  }, [actions])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const total = actions.length
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIdx((prev) =>
          e.key === "ArrowUp" ? (prev <= 0 ? total - 1 : prev - 1) : (prev >= total - 1 ? 0 : prev + 1),
        )
      } else if (e.key === "Enter") {
        e.preventDefault()
        onSelect(actions[activeIdx].label)
      } else if (e.key === "Escape") {
        e.preventDefault()
        onDismiss()
      }
    },
    [actions, activeIdx, onSelect, onDismiss],
  )

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="card-enter rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden"
    >
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <SkillHashGlyph seedText={currentAgent.seedText} size={20} />
            <span className="text-[13px] font-semibold text-slate-700">请选择</span>
          </div>
          <button
            onClick={onDismiss}
            className="rounded-md p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
        {questionText && (
          <div className="text-[12px] text-slate-500 leading-relaxed whitespace-pre-line max-h-[30vh] overflow-y-auto scrollbar-none">
            {questionText.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
              part.startsWith("**") && part.endsWith("**")
                ? <strong key={i} className="font-semibold text-slate-700">{part.slice(2, -2)}</strong>
                : <span key={i}>{part}</span>,
            )}
          </div>
        )}
      </div>

      <div className="px-2 pb-1">
        {actions.map((action, idx) => (
          <button
            key={action.id}
            onClick={() => onSelect(action.label)}
            onMouseEnter={() => setActiveIdx(idx)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
              idx === activeIdx ? "bg-slate-50" : "hover:bg-slate-50",
            )}
          >
            <span className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded text-[11px] font-medium",
              idx === activeIdx ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-400",
            )}>
              {idx + 1}
            </span>
            <span className={cn(
              "flex-1 text-[13px]",
              idx === activeIdx ? "text-slate-800 font-medium" : "text-slate-600",
            )}>
              {action.label}
            </span>
            {idx === activeIdx && (
              <CornerDownLeft className="size-3 text-slate-300 shrink-0" />
            )}
          </button>
        ))}
      </div>

      <div className="px-4 pb-2.5">
        <div className="flex items-center gap-2">
          <Pencil className="size-3 text-slate-300 shrink-0" />
          <input
            value={otherValue}
            onChange={(e) => setOtherValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && otherValue.trim()) {
                e.preventDefault()
                onSelect(otherValue.trim())
              }
            }}
            placeholder="请告诉我您的想法…"
            className="flex-1 bg-transparent text-[13px] text-slate-700 placeholder:text-slate-300 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-1.5">
        <span className="text-[10px] text-slate-300">↑↓ 选择 · Enter 确认 · Esc 跳过</span>
      </div>
    </div>
  )
}

function InputCard({
  placeholder,
  onSubmit,
}: {
  placeholder: string
  onSubmit: (value: string) => void
}) {
  const currentAgent = useCurrentAgent()
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setValue("")
  }

  return (
    <div className="card-enter rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <SkillHashGlyph seedText={currentAgent.seedText} size={20} />
        <span className="text-[13px] font-semibold text-slate-700">请输入</span>
      </div>
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-200 transition-all">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-[13px] text-slate-700 placeholder:text-slate-300 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-1.5">
        <span className="text-[10px] text-slate-300">Enter 发送</span>
      </div>
    </div>
  )
}


function AgentSessionBar({ fallback }: { fallback?: React.ReactNode }) {
  const sessions = useChatStore((s) => s.sessions)
  const activeSessionId = useChatStore((s) => s.activeSessionId)
  const switchSession = useChatStore((s) => s.switchSession)
  const createSession = useChatStore((s) => s.createSession)
  const activeBuilds = useChatStore((s) => s.activeBuilds)
  const events = useCalendarStore((s) => s.events)
  const openFloating = useCalendarStore((s) => s.openFloating)

  const sessionList = useMemo(
    () => Object.values(sessions).filter((session) => {
      const linkedEvent = events.find((e) => e.isAiGenerated && e.chatSessionId === session.id)
      if (linkedEvent) {
        const done = linkedEvent.status === "confirmed" || linkedEvent.status === "auto-published" || linkedEvent.status === "skipped"
        if (done) return false
      }
      return true
    }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [sessions, events],
  )

  const getAgentInfo = useCallback((session: typeof sessionList[0]) => {
    const stableSeed = `agent-${session.id}`
    const linkedEvent = events.find((e) => e.isAiGenerated && e.chatSessionId === session.id)
    if (linkedEvent) {
      const name = linkedEvent.title.length > 10 ? linkedEvent.title.slice(0, 10) + "…" : linkedEvent.title
      return { name, seedText: linkedEvent.id }
    }
    if (session.step >= 4 && session.title) {
      return { name: session.title.slice(0, 10), seedText: stableSeed }
    }
    return { name: session.step > 0 ? "配置中…" : "新 Agent", seedText: stableSeed }
  }, [events])

  if (sessionList.length === 0) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5">
        {fallback}
        <button
          onClick={() => createSession()}
          className="flex size-5 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 ml-auto"
          title="新建 Agent"
        >
          <Plus className="size-3" strokeWidth={2.5} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto scrollbar-none">
      {sessionList.map((session) => {
        const isActive = session.id === activeSessionId
        const hasBuild = session.focusedBuildEventId ? !!activeBuilds[session.focusedBuildEventId] : false
        const isBuilding = hasBuild && !isActive
        const needsAttention = !isActive && (() => {
          const buildId = session.focusedBuildEventId
          const build = buildId ? activeBuilds[buildId] : null
          if (build?.pendingAuth) return true
          const linkedEvent = events.find((e) => e.isAiGenerated && e.chatSessionId === session.id)
          if (linkedEvent?.status === "failed") return true
          const msgs = session.messages
          if (msgs.length === 0 || session.isTyping) return false
          const lastMsg = [...msgs].reverse().find((m) => m.role === "barrage" || m.role === "assistant")
          if (lastMsg?.actions?.length) return true
          if (lastMsg?.inputPlaceholder) return true
          if (linkedEvent?.status === "draft" && linkedEvent.aiContent?.marketOverview) return true
          return false
        })()
        const agent = getAgentInfo(session)
        return (
          <button
            key={session.id}
            onClick={() => {
              if (!isActive) {
                switchSession(session.id)
                if (needsAttention) {
                  const linkedEvent = events.find((e) => e.isAiGenerated && e.chatSessionId === session.id)
                  if (linkedEvent?.status === "draft" && linkedEvent.aiContent?.marketOverview) {
                    openFloating(linkedEvent.id)
                  }
                }
              }
            }}
            className={cn(
              "relative flex items-center gap-1.5 rounded-full px-2.5 py-1 shrink-0 transition-all",
              isActive
                ? "bg-slate-100 border border-slate-300 shadow-sm"
                : needsAttention
                  ? "bg-amber-50 border border-amber-300"
                  : isBuilding
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-white/80 border border-slate-200/60 hover:bg-slate-50 hover:border-slate-300",
            )}
          >
            {needsAttention && (
              <span className="relative flex size-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-1.5 bg-amber-500" />
              </span>
            )}
            {isBuilding && !needsAttention && (
              <span className="relative flex size-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-1.5 bg-blue-500" />
              </span>
            )}
            <SkillHashGlyph seedText={agent.seedText} size={14} />
            <span className={cn(
              "text-[11px] font-medium max-w-[80px] truncate",
              isActive ? "text-slate-700"
                : needsAttention ? "text-amber-600"
                  : isBuilding ? "text-blue-600"
                    : "text-slate-500",
            )}>
              {agent.name}
            </span>
            {needsAttention && (
              <span className="absolute -top-1 -right-1 flex size-3 items-center justify-center rounded-full bg-amber-500 text-white text-[8px] font-bold">!</span>
            )}
          </button>
        )
      })}
      <button
        onClick={() => createSession()}
        className="flex size-5 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
        title="新建 Agent"
      >
        <Plus className="size-3" strokeWidth={2.5} />
      </button>
    </div>
  )
}

export function ConversationPanel() {
  const messages = useChatStore((s) => s.messages)
  const isTyping = useChatStore((s) => s.isTyping)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const floatingEventIds = useCalendarStore((s) => s.floatingEventIds)
  const hasFloating = floatingEventIds.length > 0
  const buildPhases = useChatStore((s) => s.buildPhases)
  const pendingAuth = useChatStore((s) => s.pendingAuth)
  const focusedBuildEventId = useChatStore((s) => s.focusedBuildEventId)
  const sidebarType = useCalendarStore((s) => s.sidebarType)
  const currentAgent = useCurrentAgent()
  const topAuth = useMemo(() => {
    if (!pendingAuth) return null
    if (!focusedBuildEventId) return null
    return pendingAuth.eventId === focusedBuildEventId ? pendingAuth : null
  }, [pendingAuth, focusedBuildEventId])
  const [value, setValue] = useState("")
  const [dismissedMsgId, setDismissedMsgId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasMessages = messages.length > 0
  const buildCompleted = useChatStore((s) => s.buildCompleted)

  const lastAssistantMsg = useMemo(
    () => [...messages].reverse().find((m) => m.role === "barrage" || m.role === "assistant"),
    [messages],
  )

  useEffect(() => {
    if (lastAssistantMsg && lastAssistantMsg.id !== dismissedMsgId) {
      setDismissedMsgId(null)
    }
  }, [lastAssistantMsg?.id])

  const pendingActions =
    !isTyping && lastAssistantMsg?.actions?.length && dismissedMsgId !== lastAssistantMsg.id
      ? lastAssistantMsg.actions : null
  const pendingInput =
    !isTyping && lastAssistantMsg?.inputPlaceholder ? lastAssistantMsg.inputPlaceholder : null

  const stopCurrentWork = useChatStore((s) => s.stopCurrentWork)

  const openFloating = useCalendarStore((s) => s.openFloating)
  const isBuilding = buildPhases.length > 0
  const isWorking = isTyping || buildPhases.some((p) => p.status === "running") || !!topAuth

  useEffect(() => {
    if (isBuilding && focusedBuildEventId && !floatingEventIds.includes(focusedBuildEventId)) {
      openFloating(focusedBuildEventId)
    }
  }, [isBuilding, focusedBuildEventId])

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (isTyping) {
      stopCurrentWork()
    }
    sendMessage(trimmed)
    setValue("")
  }

  const handleSelectAction = (label: string) => {
    const msgs = useChatStore.getState().messages
    const last = [...msgs].reverse().find((m) => m.role === "barrage" || m.role === "assistant")

    const clearLastActions = () => {
      if (last?.actions) {
        useChatStore.setState({
          messages: msgs.map((m) => m.id === last.id ? { ...m, actions: undefined } : m),
        })
      }
    }

    if (label === "确认发布" || label === "跳过本次") {
      const sid = useChatStore.getState().activeSessionId
      const evts = useCalendarStore.getState().events
      const draft = evts.find((e) => e.isAiGenerated && e.status === "draft" && e.chatSessionId === sid)
      if (draft) {
        if (label === "确认发布") {
          useCalendarStore.getState().confirmEvent(draft.id)
        } else {
          useCalendarStore.getState().skipEvent(draft.id)
        }
        clearLastActions()
        return
      }
    }

    const isReauthAction = label === "立即重新授权" || label.startsWith("重新")
    const isDismissAuthAction = label === "稍后再说" || label === "晚点再说"
    if (isReauthAction || isDismissAuthAction) {
      const sid = useChatStore.getState().activeSessionId
      const evts = useCalendarStore.getState().events
      const failed = evts.find((e) => e.isAiGenerated && e.status === "failed" && e.chatSessionId === sid)
        ?? evts.find((e) => e.isAiGenerated && e.status === "failed")
      if (isReauthAction && failed) {
        useChatStore.getState().restartFailedEventAuth(failed.id)
      }
      clearLastActions()
      return
    }

    clearLastActions()
    setDismissedMsgId(null)
    sendMessage(label)
  }

  const dismissActions = () => {
    if (lastAssistantMsg) {
      setDismissedMsgId(lastAssistantMsg.id)
    }
  }

  return (
    <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-3 sm:px-6 z-10">
      {/* event floating panel */}
      {hasFloating && (
        <div className="mb-2">
          <EventFloatingPanel />
        </div>
      )}

      {/* build process now shown inside EventFloatingPanel's build tab */}

      {/* auth is now merged into OptionButtons above */}

      {/* Agent bar: always above input, hide only in agents view or when floating panel is open */}
      {!hasFloating && sidebarType !== "agents" && (
        <AgentSessionBar fallback={!pendingInput ? <AgentBar /> : undefined} />
      )}

      {/* option buttons — hide pendingActions when floating panel is open, but always show auth */}
      {((pendingActions && !hasFloating) || topAuth) && (
        <div className="mb-2">
          <OptionButtons
            actions={[
              ...(pendingActions ?? []),
              ...(topAuth ? [
                { id: `auth-${topAuth.phaseId}`, label: topAuth.label, variant: "primary" as const },
                { id: `auth-skip-${topAuth.phaseId}`, label: "跳过授权", variant: "secondary" as const },
              ] : []),
            ]}
            onSelect={(label) => {
              if (topAuth && label === topAuth.label) {
                useChatStore.getState().authorizeBuildPhase(topAuth.phaseId)
              } else if (topAuth && label === "跳过授权") {
                useChatStore.getState().cancelAuth(topAuth.phaseId)
              } else {
                handleSelectAction(label)
              }
            }}
            onDismiss={dismissActions}
            questionText={topAuth ? (topAuth.authType === "oauth" ? "需要授权才能继续构建" : "需要域名授权") : lastAssistantMsg?.content}
          />
        </div>
      )}

      {/* input card (e.g. LinkedIn URL input) — hide during build or when floating panel is open */}
      {pendingInput && !pendingActions && !topAuth && !isBuilding && !hasFloating && (
        <div className="mb-2">
          <InputCard
            placeholder={pendingInput}
            onSubmit={(val) => {
              const msgs = useChatStore.getState().messages
              const last = [...msgs].reverse().find((m) => m.role === "barrage" || m.role === "assistant")
              if (last?.inputPlaceholder) {
                useChatStore.setState({
                  messages: msgs.map((m) =>
                    m.id === last.id ? { ...m, inputPlaceholder: undefined } : m,
                  ),
                })
              }
              sendMessage(val)
            }}
          />
        </div>
      )}

      {/* input bar — always visible during build */}
      {(!pendingActions && !pendingInput && !topAuth) && (
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-300/20 overflow-hidden">
          {/* barrage stream above input — hidden after build completes or when floating panel is open */}
          {hasMessages && !buildCompleted && !hasFloating && <BarrageStream />}

          <div className={cn("px-3 sm:px-5 pt-3 sm:pt-4 pb-2", hasMessages && "border-t border-slate-100")}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = "auto"
                el.style.height = Math.min(el.scrollHeight, 120) + "px"
              }}
              rows={1}
              placeholder={isWorking ? "随时输入调整指令…" : "吩咐一下，我来安排…"}
              className="w-full resize-none bg-transparent text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none leading-relaxed"
              style={{ minHeight: "36px" }}
            />
          </div>

          <div className="flex items-center justify-between px-3 sm:px-4 pb-2.5 sm:pb-3 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <SkillHashGlyph seedText={currentAgent.seedText} size={14} />
              <span>{currentAgent.name} · {isWorking ? currentAgent.label : "随时吩咐"}</span>
            </div>
            {isWorking && !value.trim() ? (
              <button
                onClick={stopCurrentWork}
                className="flex items-center justify-center size-7 sm:size-8 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors"
              >
                <div className="size-3 sm:size-3.5 rounded-sm bg-white" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!value.trim()}
                className={cn(
                  "flex items-center justify-center size-7 sm:size-8 rounded-full text-white transition-colors",
                  value.trim()
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-slate-200 text-slate-400",
                )}
              >
                <ArrowUp className="size-3.5 sm:size-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
