import { Calendar, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCalendarStore } from "@/stores/calendarStore"
import { CalendarView } from "@/components/calendar/CalendarView"
import { ChatView } from "@/components/chat/ChatView"
import type { PageView } from "@/types"

const tabs: { id: PageView; label: string; icon: typeof Calendar }[] = [
  { id: "calendar", label: "日历", icon: Calendar },
  { id: "chat", label: "AI 助手", icon: MessageSquare },
]

function App() {
  const pageView = useCalendarStore((s) => s.pageView)
  const setPageView = useCalendarStore((s) => s.setPageView)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* top nav */}
      <header className="flex items-center justify-between border-b border-border px-6 py-2.5">
        <h1 className="text-sm font-bold text-foreground tracking-tight">
          📅 Calendar AI
        </h1>
        <nav className="flex gap-1 rounded-full border border-border bg-muted/50 p-0.5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPageView(id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                pageView === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </nav>
        <div className="w-20" />
      </header>

      {/* page content */}
      <main className="flex-1 overflow-hidden">
        {pageView === "calendar" && <CalendarView />}
        {pageView === "chat" && <ChatView />}
      </main>
    </div>
  )
}

export default App
