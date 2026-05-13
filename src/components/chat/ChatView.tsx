import { useRef, useEffect, useState, useCallback } from "react"
import {
  Send,
  Loader2,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Sparkles,
  Zap,
  ClipboardList,
  X,
  CornerDownLeft,
  Pencil,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/stores/chatStore"
import type { ChatMessage, ChatAction, SubProcess } from "@/types"

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-stone-800">
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
      <CheckCircle2 className="size-4 text-amber-600 shrink-0" />
    ) : sub.status === "error" ? (
      <Circle className="size-4 text-red-400 shrink-0" />
    ) : (
      <Circle className="size-4 text-stone-300 shrink-0" />
    )

  return (
    <div className={cn(depth > 0 && "ml-5 border-l-2 border-amber-100 pl-4")}>
      <button
        onClick={() => hasContent && setCollapsed(!collapsed)}
        className={cn(
          "flex w-full items-center gap-2.5 py-1.5 text-sm rounded-lg transition-colors",
          hasContent && "cursor-pointer hover:bg-amber-50/80 -mx-2 px-2",
        )}
      >
        {hasContent ? (
          collapsed ? (
            <ChevronRight className="size-3.5 text-stone-400 shrink-0" />
          ) : (
            <ChevronDown className="size-3.5 text-stone-400 shrink-0" />
          )
        ) : (
          <div className="w-3.5 shrink-0" />
        )}
        {statusIcon}
        <span className={cn(
          "flex-1 text-left",
          sub.status === "done" ? "text-stone-500" : "font-medium text-stone-700",
        )}>
          {sub.title}
        </span>
        {sub.status === "done" && !hasChildren && (
          <span className="text-[10px] text-stone-400 shrink-0">✓</span>
        )}
      </button>

      {!collapsed && sub.detail && (
        <div className="ml-10 mb-1.5 rounded-lg bg-white/60 border border-amber-100/50 px-3 py-2 text-xs text-stone-500 leading-relaxed whitespace-pre-line">
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

function AgentCard({ message }: { message: ChatMessage }) {
  const sendMessage = useChatStore((s) => s.sendMessage)
  const isTyping = useChatStore((s) => s.isTyping)

  const isUser = message.role === "user"
  const hasSubProcesses = message.subProcesses && message.subProcesses.length > 0

  const IconComp = message.icon === "build" ? Zap : message.icon === "task" ? ClipboardList : null

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-stone-800 text-white px-4 py-3 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 items-start">
      {/* left icon */}
      {IconComp ? (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-400 shadow-sm shadow-amber-200/50">
          <IconComp className="size-4.5 text-white" />
        </div>
      ) : (
        <div className="w-9 shrink-0" />
      )}

      {/* card body */}
      <div className="min-w-0 flex-1 space-y-2">
        {hasSubProcesses ? (
          /* sub-process tree card */
          <div className="rounded-xl bg-amber-50/50 border border-amber-100/80 p-4">
            <p className="text-[15px] font-semibold text-stone-800 mb-3">
              <RichText text={message.content} />
            </p>
            <div className="space-y-0">
              {message.subProcesses!.map((sub) => (
                <SubProcessNode key={sub.id} sub={sub} />
              ))}
            </div>
          </div>
        ) : (
          /* text card */
          <div className="rounded-xl bg-amber-50/50 border border-amber-100/80 px-4 py-3">
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              <RichText text={message.content} />
            </p>
          </div>
        )}

        {/* actions are shown in the bottom input area */}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-400 shadow-sm shadow-amber-200/50">
        <Sparkles className="size-4.5 text-white" />
      </div>
      <div className="inline-flex items-center gap-2 rounded-xl bg-amber-50/50 border border-amber-100/80 px-4 py-3">
        <Loader2 className="size-4 animate-spin text-amber-500" />
        <span className="text-sm text-stone-400">思考中…</span>
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
  const otherRef = useRef<HTMLInputElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [showOther, setShowOther] = useState(false)
  const [otherValue, setOtherValue] = useState("")

  useEffect(() => {
    if (!pendingActions && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [pendingActions])

  useEffect(() => {
    if (pendingActions) {
      setActiveIdx(0)
      setShowOther(false)
      setOtherValue("")
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

  if (pendingActions) {
    return (
      <div
        className="border-t border-stone-200/60 bg-[#faf8f5]"
        tabIndex={0}
        onKeyDown={handleActionsKeyDown}
        ref={(el) => el?.focus()}
      >
        <div className="mx-auto max-w-2xl">
          {/* header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span className="text-[15px] font-semibold text-stone-700">想做什么?</span>
            <button
              onClick={dismissActions}
              className="rounded-lg p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* option list */}
          <div className="px-3 pb-1">
            {pendingActions.map((action, idx) => (
              <button
                key={action.id}
                onClick={() => onSelectAction(action.label)}
                onMouseEnter={() => setActiveIdx(idx)}
                className={cn(
                  "flex w-full items-center gap-3.5 rounded-xl px-3 py-3 text-left transition-colors",
                  idx === activeIdx ? "bg-amber-50/80" : "hover:bg-stone-50",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-medium",
                    idx === activeIdx
                      ? "bg-amber-100 text-amber-700"
                      : "bg-stone-100 text-stone-400",
                  )}
                >
                  {idx + 1}
                </span>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    idx === activeIdx ? "text-stone-800 font-medium" : "text-stone-600",
                  )}
                >
                  {action.label}
                </span>
                {idx === activeIdx && (
                  <CornerDownLeft className="size-3.5 text-stone-300 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* "Other" free input */}
          <div className="px-5 pb-3">
            {showOther ? (
              <div className="flex items-center gap-2">
                <Pencil className="size-3.5 text-stone-300 shrink-0" />
                <input
                  ref={otherRef}
                  value={otherValue}
                  onChange={(e) => setOtherValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && otherValue.trim()) {
                      e.preventDefault()
                      onSelectAction(otherValue.trim())
                    } else if (e.key === "Escape") {
                      setShowOther(false)
                    }
                  }}
                  autoFocus
                  placeholder="输入你的想法…"
                  className="flex-1 bg-transparent text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none"
                />
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowOther(true)
                  setTimeout(() => otherRef.current?.focus(), 50)
                }}
                className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
              >
                <Pencil className="size-3.5" />
                <span>Other</span>
              </button>
            )}
          </div>

          {/* footer hints */}
          <div className="flex items-center justify-between border-t border-stone-100 px-5 py-2">
            <span className="text-[11px] text-stone-300">
              ↑ ↓ to navigate · Enter to select · Esc to skip
            </span>
            <button
              onClick={dismissActions}
              className="text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-stone-100 bg-white/80 backdrop-blur-sm px-4 py-3">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-end gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-2 shadow-sm focus-within:border-amber-300 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="描述你想自动化的任务…"
            disabled={isTyping}
            className="flex-1 resize-none bg-transparent text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none disabled:opacity-50 max-h-32"
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
            className="size-8 shrink-0 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30"
          >
            {isTyping ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-stone-300">
          <CornerDownLeft className="inline size-3 mr-0.5 -mt-0.5" />
          发送
        </p>
      </div>
    </div>
  )
}

function EmptyState() {
  const sendMessage = useChatStore((s) => s.sendMessage)

  const suggestions = [
    "每天早上九点帮我抓取哥伦布市富兰克林县新房源，有新房源就用我的风格生成LinkedIn帖子和推广邮件",
    "帮我每天整理10条科技新闻并推送",
    "创建一个每日市场分析的定时任务",
  ]

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-400 text-white mb-6 shadow-lg shadow-amber-200/40">
        <Sparkles className="size-7" />
      </div>
      <h2 className="text-xl font-bold text-stone-800 mb-2">AI 助手</h2>
      <p className="text-sm text-stone-400 text-center max-w-sm mb-8">
        描述你需要自动化的工作，我会帮你构建 Agent 并设定定时任务。
      </p>
      <div className="flex flex-col gap-2 w-full max-w-md">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            className="rounded-xl border border-amber-100 bg-amber-50/40 px-4 py-3 text-sm text-left text-stone-500 hover:text-stone-800 hover:border-amber-200 hover:bg-amber-50 transition-all"
          >
            {s}
          </button>
        ))}
      </div>
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
    <div className="flex h-full flex-col bg-[#faf8f5]">
      {/* message stream */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
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
