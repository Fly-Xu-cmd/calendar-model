import { useRef, useEffect } from "react"
import { Bot, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAgentStore } from "@/stores/agentStore"
import type { ChatMessage } from "@/types"

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"
  const selectOption = useAgentStore((s) => s.selectOption)
  const isTyping = useAgentStore((s) => s.isTyping)

  return (
    <div
      className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>

      <div className={cn("max-w-[80%] space-y-2", isUser && "text-right")}>
        <div
          className={cn(
            "inline-block rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line",
            isUser
              ? "rounded-tr-md bg-primary text-primary-foreground"
              : "rounded-tl-md bg-muted text-foreground"
          )}
        >
          {message.content}
        </div>

        {message.options && (
          <div className="flex flex-wrap gap-1.5">
            {message.options.map((opt) => (
              <Button
                key={opt.id}
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
                disabled={isTyping}
                onClick={() => selectOption(opt)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Bot className="size-3.5" />
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        思考中…
      </div>
    </div>
  )
}

export function ChatOverlay() {
  const chatHistory = useAgentStore((s) => s.chatHistory)
  const isTyping = useAgentStore((s) => s.isTyping)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory, isTyping])

  if (chatHistory.length === 0 && !isTyping) return null

  return (
    <div className="absolute bottom-[calc(100%+12px)] left-0 w-full max-h-[min(400px,60vh)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-md">
      <div className="space-y-4 p-4">
        {chatHistory.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
