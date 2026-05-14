import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import {
  ArrowUp,
  Loader2,
  X,
  Pencil,
  CornerDownLeft,
  Send,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatStore, STEP_METAS } from "@/stores/chatStore"
import { useCalendarStore } from "@/stores/calendarStore"
import { SkillHashGlyph } from "@/components/calendar/SkillHashGlyph"
import { EventFloatingPanel } from "@/components/calendar/EventFloatingPanel"
import type { ChatAction } from "@/types"

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
  const [otherValue, setOtherValue] = useState("")
  const otherRef = useRef<HTMLInputElement>(null)
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
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <SkillHashGlyph seedText="ai-assistant" size={20} />
          <span className="text-[15px] font-semibold text-slate-700">请选择</span>
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
              "flex size-5 shrink-0 items-center justify-center rounded text-[15px] font-medium",
              idx === activeIdx ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-400",
            )}>
              {idx + 1}
            </span>
            <span className={cn(
              "flex-1 text-[15px]",
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
            ref={otherRef}
            value={otherValue}
            onChange={(e) => setOtherValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && otherValue.trim()) {
                e.preventDefault()
                onSelect(otherValue.trim())
              }
            }}
            placeholder="请告诉我您的想法…"
            className="flex-1 bg-transparent text-[15px] text-slate-700 placeholder:text-slate-300 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-1.5">
        <span className="text-[15px] text-slate-300">↑↓ 选择 · Enter 确认 · Esc 跳过</span>
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
        <SkillHashGlyph seedText="ai-assistant" size={20} />
        <span className="text-[15px] font-semibold text-slate-700">请输入</span>
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
            className="flex-1 bg-transparent text-[15px] text-slate-700 placeholder:text-slate-300 focus:outline-none"
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
        <span className="text-[15px] text-slate-300">Enter 发送</span>
      </div>
    </div>
  )
}

function TaskSummaryBar() {
  const messages = useChatStore((s) => s.messages)
  const isTyping = useChatStore((s) => s.isTyping)
  const step = useChatStore((s) => s.step)

  if (messages.length === 0) return null

  let summary: string

  if (isTyping) {
    const meta = STEP_METAS[step] ?? STEP_METAS[STEP_METAS.length - 1]
    summary = `${meta.icon} ${meta.title}…`
  } else {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")
    if (!lastAssistant) return null

    const text = lastAssistant.content.replace(/\*\*/g, "")
    summary = text.length > 40 ? text.slice(0, 40) + "…" : text
  }

  return (
    <div className="mb-2 flex justify-center">
      <div className="card-enter inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 px-4 py-1.5 shadow-sm max-w-[90%]">
        {isTyping && (
          <span className="relative flex size-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-blue-500" />
          </span>
        )}
        <span className="text-[15px] text-slate-600 truncate">{summary}</span>
      </div>
    </div>
  )
}

export function ConversationPanel() {
  const messages = useChatStore((s) => s.messages)
  const isTyping = useChatStore((s) => s.isTyping)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const floatingEventId = useCalendarStore((s) => s.floatingEventId)
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasMessages = messages.length > 0

  const lastAssistantMsg = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant"),
    [messages],
  )
  const pendingActions =
    !isTyping && lastAssistantMsg?.actions?.length ? lastAssistantMsg.actions : null
  const pendingInput =
    !isTyping && lastAssistantMsg?.inputPlaceholder ? lastAssistantMsg.inputPlaceholder : null

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

  return (
    <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-3 sm:px-6 z-10">
      {/* event floating panel (above input, linked to conversation) */}
      {floatingEventId && (
        <div className="mb-2">
          <EventFloatingPanel />
        </div>
      )}

      {/* single-line task summary (hidden when floating panel is open) */}
      {!floatingEventId && <TaskSummaryBar />}

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

      {/* input card (e.g. LinkedIn URL input, replaces input when AI needs text input) */}
      {pendingInput && !pendingActions && (
        <div className="mb-2">
          <InputCard
            placeholder={pendingInput}
            onSubmit={(val) => {
              const msgs = useChatStore.getState().messages
              const last = [...msgs].reverse().find((m) => m.role === "assistant")
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
              className="group flex items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200/80 bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 text-[15px] sm:text-[15px] text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-white hover:shadow-md transition-all shadow-sm whitespace-nowrap shrink-0"
            >
              <span className="text-sm sm:text-[15px]">{s.icon}</span>
              <span>{s.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* input bar (hidden when options or input card are showing) */}
      {!pendingActions && !pendingInput && (
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
              className="w-full resize-none bg-transparent text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none leading-relaxed disabled:opacity-50"
              style={{ minHeight: "36px" }}
            />
          </div>

          <div className="flex items-center justify-between px-3 sm:px-4 pb-2.5 sm:pb-3 pt-1">
            <div className="flex items-center gap-1.5 text-[15px] sm:text-[15px] text-slate-400">
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
