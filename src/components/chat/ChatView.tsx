import { useRef, useEffect, useState, useCallback, useMemo } from "react"
import {
  Send,
  Loader2,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Zap,
  ClipboardList,
  X,
  CornerDownLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SkillHashGlyph } from "@/components/calendar/SkillHashGlyph"
import { useChatStore } from "@/stores/chatStore"
import { useCalendarStore } from "@/stores/calendarStore"
import type { ChatMessage, ChatAction, SubProcess } from "@/types"

const THINKING_PHRASES = [
  "容我想想…",
  "正在为您查看…",
  "稍等片刻…",
  "让我整理一下…",
  "马上为您安排…",
  "好的，我来处理…",
  "这就帮您看看…",
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getTimeGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return "夜深了，您还在忙呢"
  if (h < 9) return "早安，新的一天开始了"
  if (h < 12) return "上午好，今天有什么安排？"
  if (h < 14) return "午好，别忘了休息一下"
  if (h < 18) return "下午好，一切都在掌控中"
  if (h < 22) return "晚上好，今天辛苦了"
  return "夜深了，注意休息哦"
}

function relativeTime(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 10) return "刚刚"
  if (seconds < 60) return `${seconds}秒前`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}

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
      <CheckCircle2 className="size-4 text-slate-500 shrink-0" />
    ) : sub.status === "error" ? (
      <Circle className="size-4 text-slate-400 shrink-0" />
    ) : (
      <Circle className="size-4 text-slate-300 shrink-0" />
    )

  return (
    <div className={cn(depth > 0 && "ml-5 border-l-2 border-slate-100 pl-4")}>
      <button
        onClick={() => hasContent && setCollapsed(!collapsed)}
        className={cn(
          "flex w-full items-center gap-2.5 py-1.5 text-sm rounded-lg transition-colors",
          hasContent && "cursor-pointer hover:bg-slate-50 -mx-2 px-2",
        )}
      >
        {hasContent ? (
          collapsed ? (
            <ChevronRight className="size-3.5 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="size-3.5 text-slate-400 shrink-0" />
          )
        ) : (
          <div className="w-3.5 shrink-0" />
        )}
        {statusIcon}
        <span className={cn(
          "flex-1 text-left",
          sub.status === "done" ? "text-slate-500" : "font-medium text-slate-700",
        )}>
          {sub.title}
        </span>
        {sub.status === "done" && !hasChildren && (
          <span className="text-[10px] text-slate-400 shrink-0">✓</span>
        )}
      </button>

      {!collapsed && sub.detail && (
        <div className="ml-10 mb-1.5 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-500 leading-relaxed whitespace-pre-line">
          {sub.detail}
        </div>
      )}

      {!collapsed && hasChildren && (
        <div className="mt-0.5 space-y-0">
          {sub.children!.map((child) => (
            <SubProcessNode key={child.id} sub={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function MessageTime({ date }: { date: Date }) {
  const [display, setDisplay] = useState(() => relativeTime(date))

  useEffect(() => {
    const id = setInterval(() => setDisplay(relativeTime(date)), 30_000)
    return () => clearInterval(id)
  }, [date])

  return (
    <span className="text-[10px] text-slate-300 select-none">{display}</span>
  )
}

function AiAvatar({ icon }: { icon?: ChatMessage["icon"] }) {
  if (icon === "build" || icon === "task") {
    const IconComp = icon === "build" ? Zap : ClipboardList
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-sm ring-1 ring-white/10">
        <IconComp className="size-4.5 text-white/90" />
      </div>
    )
  }
  return (
    <div className="shrink-0">
      <SkillHashGlyph seedText="ai-assistant" size={36} />
    </div>
  )
}

function AgentCard({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"
  const hasSubProcesses = message.subProcesses && message.subProcesses.length > 0

  if (isUser) {
    return (
      <div className="msg-enter flex justify-end gap-2 items-end">
        <MessageTime date={message.timestamp} />
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-slate-800 text-white px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
          <p className="text-[13px] sm:text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="msg-enter flex gap-3 items-start">
      <AiAvatar icon={message.icon} />

      <div className="min-w-0 flex-1 space-y-2">
        {hasSubProcesses ? (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[15px] font-semibold text-slate-800 mb-3">
              <RichText text={message.content} />
            </p>
            <div className="space-y-0">
              {message.subProcesses!.map((sub) => (
                <SubProcessNode key={sub.id} sub={sub} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              <RichText text={message.content} />
            </p>
          </div>
        )}
        <MessageTime date={message.timestamp} />
      </div>
    </div>
  )
}

function TypingIndicator() {
  const phrase = useMemo(() => pickRandom(THINKING_PHRASES), [])
  return (
    <div className="msg-enter flex gap-3 items-start">
      <AiAvatar />
      <div className="inline-flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
        <span className="flex items-center gap-1 text-slate-400">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </span>
        <span className="text-sm text-slate-400">{phrase}</span>
      </div>
    </div>
  )
}

function InputArea({
  inputValue,
  setInputValue,
  onSubmit,
  onKeyDown,
  isTyping,
  pendingActions,
  onSelectAction,
}: {
  inputValue: string
  setInputValue: (v: string) => void
  onSubmit: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  isTyping: boolean
  pendingActions: ChatAction[] | null
  onSelectAction: (label: string) => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    if (!pendingActions && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [pendingActions])

  useEffect(() => {
    if (pendingActions) {
      setActiveIdx(0)
    }
  }, [pendingActions])

  const dismissActions = useCallback(() => {
    const msgs = useChatStore.getState().messages
    const last = [...msgs].reverse().find((m) => m.role === "assistant")
    if (last?.actions) {
      useChatStore.setState({
        messages: msgs.map((m) =>
          m.id === last.id ? { ...m, actions: undefined } : m,
        ),
      })
    }
  }, [])

  const handleActionsKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!pendingActions) return
      const total = pendingActions.length
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIdx((prev) => {
          if (e.key === "ArrowUp") return prev <= 0 ? total - 1 : prev - 1
          return prev >= total - 1 ? 0 : prev + 1
        })
      } else if (e.key === "Enter") {
        e.preventDefault()
        onSelectAction(pendingActions[activeIdx].label)
      } else if (e.key === "Escape") {
        e.preventDefault()
        dismissActions()
      }
    },
    [pendingActions, activeIdx, onSelectAction, dismissActions],
  )

  return (
    <div className="border-t border-slate-200/60 bg-[#faf8f5]">
      {/* option buttons (shown above input when AI asks) */}
      {pendingActions && (
        <div
          tabIndex={0}
          onKeyDown={handleActionsKeyDown}
          ref={(el) => el?.focus()}
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <span className="text-[15px] font-semibold text-slate-700">您想怎么做？</span>
            <button
              onClick={dismissActions}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="px-3 pb-2">
            {pendingActions.map((action, idx) => (
              <button
                key={action.id}
                onClick={() => onSelectAction(action.label)}
                onMouseEnter={() => setActiveIdx(idx)}
                className={cn(
                  "flex w-full items-center gap-3.5 rounded-xl px-3 py-3 text-left transition-colors",
                  idx === activeIdx ? "bg-slate-50" : "hover:bg-slate-50",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-medium",
                    idx === activeIdx
                      ? "bg-slate-200 text-slate-700"
                      : "bg-slate-100 text-slate-400",
                  )}
                >
                  {idx + 1}
                </span>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    idx === activeIdx ? "text-slate-800 font-medium" : "text-slate-600",
                  )}
                >
                  {action.label}
                </span>
                {idx === activeIdx && (
                  <CornerDownLeft className="size-3.5 text-slate-300 shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-2">
            <span className="text-[11px] text-slate-300">
              ↑ ↓ to navigate · Enter to select · Esc to skip
            </span>
            <button
              onClick={dismissActions}
              className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* text input (always visible) */}
      <div className={cn("bg-white/80 backdrop-blur-sm px-3 py-3", pendingActions && "border-t border-slate-100")}>
        <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-200 transition-all">
          <textarea
            ref={textareaRef}
            data-chat-input
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="请吩咐…"
            disabled={isTyping}
            className="flex-1 resize-none bg-transparent text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none disabled:opacity-50 max-h-32"
            style={{ minHeight: "24px" }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = "auto"
              el.style.height = Math.min(el.scrollHeight, 128) + "px"
            }}
          />
          <Button
            size="icon"
            onClick={onSubmit}
            disabled={!inputValue.trim() || isTyping}
            className="size-8 shrink-0 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
          >
            {isTyping ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-300">
          <CornerDownLeft className="inline size-3 mr-0.5 -mt-0.5" />
          发送
        </p>
      </div>
    </div>
  )
}

function EmptyState() {
  const sendMessage = useChatStore((s) => s.sendMessage)
  const greeting = useMemo(() => getTimeGreeting(), [])

  const suggestions = [
    "每天早上九点帮我抓取哥伦布市富兰克林县新房源，有新房源就用我的风格生成LinkedIn帖子和推广邮件",
    "帮我每天整理10条科技新闻并推送",
    "创建一个每日市场分析的定时任务",
  ]

  return (
    <div className="msg-enter flex flex-col items-center justify-center py-12 px-3">
      <div className="mb-4">
        <SkillHashGlyph seedText="ai-assistant" size={48} />
      </div>
      <h2 className="text-base font-bold text-slate-800 mb-1.5">{greeting}</h2>
      <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed">
        我是您的私人助理，随时听候吩咐。<br />有什么需要我帮您打理的吗？
      </p>
      <div className="flex flex-col gap-2 w-full">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            className="group rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-left text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-all"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-1.5">💡</span>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function EventContextBar() {
  const selectedEventId = useCalendarStore((s) => s.selectedEventId)
  const events = useCalendarStore((s) => s.events)

  const event = selectedEventId ? events.find((e) => e.id === selectedEventId) : null
  if (!event?.isAiGenerated) return null

  return (
    <div className="mx-3 mb-2 flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
      <div className="shrink-0"><SkillHashGlyph seedText="ai-assistant" size={14} /></div>
      <span className="text-[11px] text-slate-500 truncate flex-1">
        关联事项：{event.title}
      </span>
      <span className="text-[10px] text-slate-400 shrink-0">随时可以调整</span>
    </div>
  )
}

export function ChatView() {
  const messages = useChatStore((s) => s.messages)
  const isTyping = useChatStore((s) => s.isTyping)
  const inputValue = useChatStore((s) => s.inputValue)
  const setInputValue = useChatStore((s) => s.setInputValue)
  const sendMessage = useChatStore((s) => s.sendMessage)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant")
  const pendingActions =
    !isTyping && lastAssistantMsg?.actions?.length ? lastAssistantMsg.actions : null

  const handleSubmit = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isTyping) return
    sendMessage(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* message stream */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-4">
          {messages.length === 0 && !isTyping ? (
            <EmptyState />
          ) : (
            <>
              {messages.map((msg) => (
                <AgentCard key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* event context bar */}
      <EventContextBar />

      {/* input area */}
      <InputArea
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        isTyping={isTyping}
        pendingActions={pendingActions}
        onSelectAction={(label) => sendMessage(label)}
      />
    </div>
  )
}
