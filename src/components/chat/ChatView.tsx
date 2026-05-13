import { useRef, useEffect, useState } from "react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import {
  Send,
  Bot,
  User,
  Loader2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/stores/chatStore"
import { useCalendarStore } from "@/stores/calendarStore"
import type { ChatMessage, SubProcess } from "@/types"

function SubProcessCard({ sub }: { sub: SubProcess }) {
  const [collapsed, setCollapsed] = useState(true)

  const statusIcon =
    sub.status === "done" ? (
      <CheckCircle2 className="size-3.5 text-emerald-500" />
    ) : sub.status === "error" ? (
      <AlertCircle className="size-3.5 text-red-500" />
    ) : (
      <Loader2 className="size-3.5 animate-spin text-blue-500" />
    )

  return (
    <div className="rounded-lg border border-border/60 bg-muted/40 overflow-hidden transition-all">
      <button
        onClick={() => sub.detail && setCollapsed(!collapsed)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted/60 transition-colors"
      >
        {sub.detail ? (
          collapsed ? (
            <ChevronRight className="size-3 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="size-3 text-muted-foreground shrink-0" />
          )
        ) : (
          <div className="w-3" />
        )}
        {statusIcon}
        <span className="flex-1 text-left text-foreground font-medium">
          {sub.title}
        </span>
      </button>
      {!collapsed && sub.detail && (
        <div className="border-t border-border/40 px-3 py-2.5 text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
          {sub.detail}
        </div>
      )}
    </div>
  )
}

function MessageCard({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"
  const setPageView = useCalendarStore((s) => s.setPageView)

  return (
    <div
      className={cn(
        "flex gap-3 w-full",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-white mt-1">
          <Bot className="size-4" />
        </div>
      )}

      <div className={cn("max-w-[85%] min-w-0", isUser && "order-first")}>
        <div
          className={cn(
            "rounded-2xl border transition-all",
            isUser
              ? "rounded-tr-md bg-primary text-primary-foreground border-primary/20 px-4 py-3"
              : "rounded-tl-md bg-card border-border px-4 py-3 shadow-sm",
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {message.content}
          </p>

          {message.subProcesses && message.subProcesses.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {message.subProcesses.map((sub) => (
                <SubProcessCard key={sub.id} sub={sub} />
              ))}
            </div>
          )}

          {message.actions && message.actions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant === "primary" ? "default" : "outline"}
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => {
                    if (action.label === "查看日历") {
                      setPageView("calendar")
                    }
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <p className="mt-1 px-1 text-[10px] text-muted-foreground/50">
          {format(message.timestamp, "HH:mm", { locale: zhCN })}
        </p>
      </div>

      {isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground mt-1">
          <User className="size-4" />
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-white mt-1">
        <Bot className="size-4" />
      </div>
      <div className="inline-flex items-center gap-2 rounded-2xl rounded-tl-md bg-card border border-border px-4 py-3 shadow-sm">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">思考中…</span>
      </div>
    </div>
  )
}

function EmptyState() {
  const sendMessage = useChatStore((s) => s.sendMessage)

  const suggestions = [
    "帮我抓取今日富兰克林县新房源",
    "生成本周市场分析报告",
    "给客户 Johnson 写一封跟进邮件",
  ]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-white mb-6 shadow-lg">
        <Sparkles className="size-7" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">
        AI 日历助理
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-8">
        描述你的需求，我会帮你处理市场分析、日程安排、邮件撰写等工作。
      </p>
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-left text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
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
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

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
      {/* messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">
          {messages.length === 0 && !isTyping ? (
            <EmptyState />
          ) : (
            <>
              {messages.map((msg) => (
                <MessageCard key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* input bar */}
      <div className="shrink-0 border-t border-border bg-background/80 backdrop-blur-sm px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm focus-within:ring-2 focus-within:ring-ring/30 transition-all">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="描述你的需求…"
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none max-h-32"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <Button
              size="icon-sm"
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isTyping}
              className="shrink-0"
            >
              <Send className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
