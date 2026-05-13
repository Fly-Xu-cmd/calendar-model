import { X, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCalendarStore } from "@/stores/calendarStore"
import { CalendarView } from "@/components/calendar/CalendarView"
import { ChatView } from "@/components/chat/ChatView"
import { SkillHashGlyph } from "@/components/calendar/SkillHashGlyph"
import { useChatStore } from "@/stores/chatStore"
import { useState, useRef } from "react"

function BottomInputBar() {
  const chatOpen = useCalendarStore((s) => s.chatOpen)
  const toggleChat = useCalendarStore((s) => s.toggleChat)
  const selectedEventId = useCalendarStore((s) => s.selectedEventId)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const resetChat = useChatStore((s) => s.resetChat)
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  if (chatOpen) return null

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (!selectedEventId) {
      resetChat()
    }
    sendMessage(trimmed)
    setValue("")
    toggleChat()
  }

  const suggestions = [
    { text: "抓取新房源并生成推广", icon: "🏠" },
    { text: "整理本周待办事项", icon: "📋" },
    { text: "生成今日市场速报", icon: "📊" },
  ]

  return (
    <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-3 sm:px-6 z-10">
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
            placeholder="吩咐一下，我来安排…"
            className="w-full resize-none bg-transparent text-sm sm:text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none leading-relaxed"
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
            disabled={!value.trim()}
            className="flex items-center justify-center size-7 sm:size-8 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
          >
            <ArrowUp className="size-3.5 sm:size-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const chatOpen = useCalendarStore((s) => s.chatOpen)
  const toggleChat = useCalendarStore((s) => s.toggleChat)

  return (
    <div className="flex h-screen overflow-hidden bg-white text-foreground">
      <div className={cn(
        "relative flex flex-1 min-w-0 flex-col overflow-hidden",
        chatOpen && "max-md:hidden",
      )}>
        <main className="flex-1 min-h-0 overflow-hidden">
          <CalendarView />
        </main>
        <BottomInputBar />
      </div>

      {chatOpen && (
        <aside className={cn(
          "flex flex-col border-l border-slate-200 bg-slate-50 overflow-hidden",
          "w-full md:w-[400px] md:shrink-0",
        )}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SkillHashGlyph seedText="ai-assistant" size={18} />
              <span className="text-sm font-semibold text-slate-700">私人助理</span>
            </div>
            <button
              onClick={toggleChat}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ChatView />
          </div>
        </aside>
      )}
    </div>
  )
}

export default App
