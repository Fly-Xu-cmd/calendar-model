import { useRef, useEffect, useState } from "react"
import {
  Send,
  Loader2,
  ChevronRight,
  CheckCircle2,
  Circle,
  Sparkles,
  Zap,
  ClipboardList,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/stores/chatStore"
import type { ChatMessage, SubProcess } from "@/types"

function SubProcessNode({ sub, depth = 0 }: { sub: SubProcess; depth?: number }) {
  const [collapsed, setCollapsed] = useState(true)
  const hasChildren = sub.children && sub.children.length > 0
  const hasContent = !!sub.detail || hasChildren

  const statusIcon =
    sub.status === "done" ? (
      <CheckCircle2 className="size-4 text-amber-600" />
    ) : sub.status === "error" ? (
      <Circle className="size-4 text-red-400" />
    ) : (
      <Circle className="size-4 text-stone-300" />
    )

  return (
    <div className={cn(depth > 0 && "ml-6 border-l-2 border-stone-200 pl-3")}>
      <button
        onClick={() => hasContent && setCollapsed(!collapsed)}
        className={cn(
          "flex w-full items-center gap-2.5 py-2 text-sm",
          hasContent && "cursor-pointer hover:bg-amber-50/50 -mx-2 px-2 rounded-lg transition-colors",
        )}
      >
        {hasContent && (
          <ChevronRight
            className={cn(
              "size-3.5 text-stone-400 shrink-0 transition-transform",
              !collapsed && "rotate-90",
            )}
          />
        )}
        {!hasContent && <div className="w-3.5" />}
        {statusIcon}
        <span className={cn(
          "flex-1 text-left",
          sub.status === "done" ? "text-stone-600" : "font-medium text-stone-800",
        )}>
          {sub.title}
        </span>
      </button>

      {!collapsed && sub.detail && (
        <div className="ml-10 mb-2 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-500 leading-relaxed">
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

function MessageCard({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] rounded-2xl rounded-tr-md bg-stone-800 text-white px-4 py-3">
          <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
        </div>
      </div>
    )
  }

  const iconBg = message.icon === "build" ? "bg-amber-400" : message.icon === "task" ? "bg-amber-400" : null
  const IconComp = message.icon === "build" ? Zap : message.icon === "task" ? ClipboardList : null

  return (
    <div className="flex gap-3">
      {/* icon */}
      {IconComp && iconBg ? (
        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full mt-0.5", iconBg)}>
          <IconComp className="size-4 text-white" />
        </div>
      ) : (
        <div className="w-8 shrink-0" />
      )}

      <div className="min-w-0 flex-1">
        {message.subProcesses && message.subProcesses.length > 0 ? (
          <div className="space-y-0.5">
            <p className="text-base font-semibold text-stone-800 mb-2">{message.content}</p>
            {message.subProcesses.map((sub) => (
              <SubProcessNode key={sub.id} sub={sub} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-amber-50/70 border border-amber-100 px-4 py-3">
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {message.content}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-400 mt-0.5">
        <Sparkles className="size-4 text-white" />
      </div>
      <div className="inline-flex items-center gap-2 rounded-xl bg-amber-50/70 border border-amber-100 px-4 py-3">
        <Loader2 className="size-4 animate-spin text-amber-600" />
        <span className="text-sm text-stone-500">思考中…</span>
      </div>
    </div>
  )
}

function EmptyState() {
  const sendMessage = useChatStore((s) => s.sendMessage)

  const suggestions = [
    "帮我每天抓取富兰克林县新房源并生成LinkedIn帖子",
    "帮我每天整理10条科技新闻并推送",
    "创建一个每日市场分析的定时任务",
  ]

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-400 text-white mb-6 shadow-lg shadow-amber-200/50">
        <Sparkles className="size-7" />
      </div>
      <h2 className="text-xl font-bold text-stone-800 mb-2">AI 助手</h2>
      <p className="text-sm text-stone-400 text-center max-w-sm mb-8">
        描述你需要自动化的工作，我会帮你构建并设定定时任务。
      </p>
      <div className="flex flex-col gap-2 w-full max-w-md">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3 text-sm text-left text-stone-500 hover:text-stone-800 hover:border-amber-200 hover:bg-amber-50 transition-all"
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
    <div className="flex h-full flex-col bg-amber-50/30">
      {/* messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
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

      {/* input */}
      <div className="shrink-0 border-t border-amber-100 bg-white/80 backdrop-blur-sm px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-end gap-2 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm focus-within:ring-2 focus-within:ring-amber-300/50 transition-all">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send Twin live feedback to adjust the build..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-stone-800 placeholder:text-stone-300 outline-none max-h-32"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <Button
              size="icon-sm"
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isTyping}
              className="shrink-0 rounded-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Send className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
