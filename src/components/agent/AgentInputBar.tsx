import { useRef, useEffect } from "react"
import { Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAgentStore } from "@/stores/agentStore"

export function AgentInputBar() {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { inputValue, setInputValue, sendMessage, close } = useAgentStore()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    sendMessage(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex w-[600px] items-end gap-2 rounded-2xl border border-border bg-card p-3 shadow-2xl">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={close}
        className="shrink-0 mb-0.5"
      >
        <X className="size-3.5" />
      </Button>
      <textarea
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="描述你的需求，例如：每天帮我抓取哥伦布市场数据..."
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none max-h-32"
        style={{ fieldSizing: "content" } as React.CSSProperties}
      />
      <Button
        size="icon-sm"
        onClick={handleSubmit}
        disabled={!inputValue.trim()}
      >
        <Send className="size-3.5" />
      </Button>
    </div>
  )
}
