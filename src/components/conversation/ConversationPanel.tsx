import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import {
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Loader2,
  X,
  CheckCircle2,
  Circle,
  Pencil,
  CornerDownLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatStore, STEP_METAS } from "@/stores/chatStore"
import { SkillHashGlyph } from "@/components/calendar/SkillHashGlyph"
import type { ChatMessage, ChatAction, SubProcess } from "@/types"

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

function SubProcessNode({ sub, depth = 0 }: { sub: SubProcess; depth?: number }) {
  const [collapsed, setCollapsed] = useState(true)
  const hasChildren = sub.children && sub.children.length > 0
  const hasContent = !!sub.detail || hasChildren

  const statusIcon =
    sub.status === "done" ? (
      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
    ) : sub.status === "error" ? (
      <Circle className="size-3.5 text-red-400 shrink-0" />
    ) : (
      <Loader2 className="size-3.5 text-blue-400 animate-spin shrink-0" />
    )

  return (
    <div className={cn(depth > 0 && "ml-4 border-l border-slate-200/60 pl-3")}>
      <button
        onClick={() => hasContent && setCollapsed(!collapsed)}
        className={cn(
          "flex w-full items-center gap-2 py-1 text-xs rounded-md transition-colors",
          hasContent && "cursor-pointer hover:bg-slate-100/50 -mx-1 px-1",
        )}
      >
        {hasContent ? (
          collapsed ? (
            <ChevronRight className="size-3 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="size-3 text-slate-400 shrink-0" />
          )
        ) : (
          <div className="w-3 shrink-0" />
        )}
        {statusIcon}
        <span className={cn(
          "flex-1 text-left",
          sub.status === "done" ? "text-slate-500" : "font-medium text-slate-700",
        )}>
          {sub.title}
        </span>
      </button>

      {!collapsed && sub.detail && (
        <div className="ml-8 mb-1 rounded-md bg-slate-50 border border-slate-100 px-2.5 py-1.5 text-[11px] text-slate-500 leading-relaxed whitespace-pre-line">
          {sub.detail}
        </div>
      )}

      {!collapsed && hasChildren && (
        <div className="mt-0.5">
          {sub.children!.map((child) => (
            <SubProcessNode key={child.id} sub={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function StepCard({
  stepIndex,
  isActive,
  isCompleted,
  isExpanded,
  userMessage,
  onToggle,
}: {
  stepIndex: number
  isActive: boolean
  isCompleted: boolean
  isExpanded: boolean
  userMessage?: string
  onToggle: () => void
}) {
  const meta = STEP_METAS[stepIndex] ?? STEP_METAS[STEP_METAS.length - 1]

  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all duration-200",
        "border",
        isExpanded
          ? "bg-white border-slate-300 shadow-sm"
          : isActive
            ? "bg-blue-50/50 border-blue-200/60 shadow-sm"
            : isCompleted
              ? "bg-white/60 border-slate-200/60 hover:bg-white hover:border-slate-300"
              : "bg-slate-50/40 border-slate-100",
      )}
    >
      <span className="text-sm shrink-0">{meta.icon}</span>
      <span className={cn(
        "text-[12px] font-medium flex-1 min-w-0 truncate",
        isActive ? "text-blue-700" : isCompleted ? "text-slate-600" : "text-slate-400",
      )}>
        {meta.title}
        {isCompleted && userMessage && (
          <span className="text-slate-400 font-normal ml-1.5">— {userMessage}</span>
        )}
      </span>
      {isCompleted && (
        <Check className="size-3.5 text-emerald-500 shrink-0" />
      )}
      {isActive && !isCompleted && (
        <Loader2 className="size-3.5 text-blue-400 animate-spin shrink-0" />
      )}
      {isCompleted && (
        isExpanded
          ? <ChevronUp className="size-3.5 text-slate-400 shrink-0" />
          : <ChevronDown className="size-3.5 text-slate-400 shrink-0" />
      )}
    </button>
  )
}

function FloatingDetail({
  messages,
  onClose,
}: {
  messages: ChatMessage[]
  onClose: () => void
}) {
  const assistantMsgs = messages.filter((m) => m.role === "assistant")

  return (
    <div className="card-enter rounded-2xl border border-slate-200/80 bg-white/88 backdrop-blur-2xl shadow-xl shadow-slate-200/40 overflow-hidden max-h-[50vh]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100/80 bg-white/50">
        <span className="text-[11px] text-slate-500 font-medium">详细内容</span>
        <button
          onClick={onClose}
          className="rounded-md p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="overflow-y-auto max-h-[calc(50vh-40px)] px-4 py-3 space-y-3">
        {assistantMsgs.map((msg) => (
          <div key={msg.id}>
            {msg.subProcesses && msg.subProcesses.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-800">
                  <RichText text={msg.content} />
                </p>
                <div className="space-y-0.5">
                  {msg.subProcesses.map((sub) => (
                    <SubProcessNode key={sub.id} sub={sub} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-line">
                <RichText text={msg.content} />
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function OptionButtons({
  actions,
  onSelect,
  onDismiss,
}: {
  actions: ChatAction[]
  onSelect: (label: string) => void
  onDismiss: () => void
}) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [showOther, setShowOther] = useState(false)
  const [otherValue, setOtherValue] = useState("")
  const otherRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveIdx(0)
    setShowOther(false)
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
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <SkillHashGlyph seedText="ai-assistant" size={20} />
          <span className="text-[13px] font-semibold text-slate-700">请选择</span>
        </div>
        <button
          onClick={onDismiss}
          className="rounded-md p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="size-3.5" />
        </button>
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
              "flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-medium",
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
        {showOther ? (
          <div className="flex items-center gap-2">
            <Pencil className="size-3 text-slate-300 shrink-0" />
            <input
              ref={otherRef}
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && otherValue.trim()) {
                  e.preventDefault()
                  onSelect(otherValue.trim())
                } else if (e.key === "Escape") {
                  setShowOther(false)
                }
              }}
              autoFocus
              placeholder="请告诉我您的想法…"
              className="flex-1 bg-transparent text-[13px] text-slate-700 placeholder:text-slate-300 focus:outline-none"
            />
          </div>
        ) : (
          <button
            onClick={() => {
              setShowOther(true)
              setTimeout(() => otherRef.current?.focus(), 50)
            }}
            className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Pencil className="size-3" />
            <span>其他</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-1.5">
        <span className="text-[10px] text-slate-300">↑↓ 选择 · Enter 确认 · Esc 跳过</span>
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 text-slate-400">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </span>
  )
}

export function ConversationPanel() {
  const messages = useChatStore((s) => s.messages)
  const isTyping = useChatStore((s) => s.isTyping)
  const step = useChatStore((s) => s.step)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const expandedStepIndex = useChatStore((s) => s.expandedStepIndex)
  const setExpandedStep = useChatStore((s) => s.setExpandedStep)
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasMessages = messages.length > 0

  const lastAssistantMsg = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant"),
    [messages],
  )
  const pendingActions =
    !isTyping && lastAssistantMsg?.actions?.length ? lastAssistantMsg.actions : null

  const stepGroups = useMemo(() => {
    const groups: Record<number, { userMsg?: string; messages: ChatMessage[] }> = {}
    for (const msg of messages) {
      const si = msg.stepIndex ?? 0
      if (!groups[si]) groups[si] = { messages: [] }
      groups[si].messages.push(msg)
      if (msg.role === "user" && !groups[si].userMsg) {
        groups[si].userMsg = msg.content.length > 20 ? msg.content.slice(0, 20) + "…" : msg.content
      }
    }
    return groups
  }, [messages])

  const completedSteps = Object.keys(stepGroups)
    .map(Number)
    .filter((si) => si < step)
    .sort((a, b) => a - b)

  const activeStep = hasMessages ? step : null

  const expandedMessages = expandedStepIndex !== null ? stepGroups[expandedStepIndex]?.messages ?? [] : []

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || isTyping) return
    sendMessage(trimmed)
    setValue("")
  }

  const handleSelectAction = (label: string) => {
    const msgs = useChatStore.getState().messages
    const last = [...msgs].reverse().find((m) => m.role === "assistant")
    if (last?.actions) {
      useChatStore.setState({
        messages: msgs.map((m) =>
          m.id === last.id ? { ...m, actions: undefined } : m,
        ),
      })
    }
    sendMessage(label)
  }

  const dismissActions = () => {
    const msgs = useChatStore.getState().messages
    const last = [...msgs].reverse().find((m) => m.role === "assistant")
    if (last?.actions) {
      useChatStore.setState({
        messages: msgs.map((m) =>
          m.id === last.id ? { ...m, actions: undefined } : m,
        ),
      })
    }
  }

  const suggestions = [
    { text: "抓取新房源并生成推广", icon: "🏠" },
    { text: "整理本周待办事项", icon: "📋" },
    { text: "生成今日市场速报", icon: "📊" },
  ]

  const showDetail = expandedStepIndex !== null && expandedMessages.length > 0

  return (
    <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-3 sm:px-6 z-10">
      {/* floating detail panel */}
      {showDetail && (
        <div className="mb-2">
          <FloatingDetail
            messages={expandedMessages}
            onClose={() => setExpandedStep(null)}
          />
        </div>
      )}

      {/* tree cards for completed & active steps */}
      {hasMessages && (
        <div className="mb-2 space-y-1">
          {completedSteps.map((si) => (
            <StepCard
              key={si}
              stepIndex={si}
              isActive={false}
              isCompleted
              isExpanded={expandedStepIndex === si}
              userMessage={stepGroups[si]?.userMsg}
              onToggle={() => setExpandedStep(expandedStepIndex === si ? null : si)}
            />
          ))}
          {activeStep !== null && stepGroups[activeStep] && (
            <StepCard
              key={activeStep}
              stepIndex={activeStep}
              isActive
              isCompleted={false}
              isExpanded={expandedStepIndex === activeStep}
              onToggle={() => setExpandedStep(expandedStepIndex === activeStep ? null : activeStep)}
            />
          )}
          {isTyping && (
            <div className="flex items-center gap-2 px-3 py-1.5">
              <TypingDots />
              <span className="text-[11px] text-slate-400">正在思考…</span>
            </div>
          )}
        </div>
      )}

      {/* option buttons (replaces input when AI asks) */}
      {pendingActions && (
        <div className="mb-2">
          <OptionButtons
            actions={pendingActions}
            onSelect={handleSelectAction}
            onDismiss={dismissActions}
          />
        </div>
      )}

      {/* suggestion chips (only when no conversation started) */}
      {!hasMessages && (
        <div className="flex gap-2 sm:gap-2.5 mb-3 justify-center overflow-x-auto scrollbar-none pb-1">
          {suggestions.map((s) => (
            <button
              key={s.text}
              onClick={() => {
                setValue(s.text)
                textareaRef.current?.focus()
              }}
              className="group flex items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200/80 bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[13px] text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-white hover:shadow-md transition-all shadow-sm whitespace-nowrap shrink-0"
            >
              <span className="text-sm sm:text-base">{s.icon}</span>
              <span>{s.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* input bar (always visible unless options are showing) */}
      {!pendingActions && (
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-300/20 overflow-hidden">
          <div className="px-3 sm:px-5 pt-3 sm:pt-4 pb-2">
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
              disabled={isTyping}
              placeholder="吩咐一下，我来安排…"
              className="w-full resize-none bg-transparent text-sm sm:text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none leading-relaxed disabled:opacity-50"
              style={{ minHeight: "36px" }}
            />
          </div>

          <div className="flex items-center justify-between px-3 sm:px-4 pb-2.5 sm:pb-3 pt-1">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
              <SkillHashGlyph seedText="ai-assistant" size={14} />
              <span>您的私人助理</span>
            </div>
            <button
              onClick={handleSend}
              disabled={!value.trim() || isTyping}
              className="flex items-center justify-center size-7 sm:size-8 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
            >
              {isTyping ? (
                <Loader2 className="size-3.5 sm:size-4 animate-spin" />
              ) : (
                <ArrowUp className="size-3.5 sm:size-4" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
