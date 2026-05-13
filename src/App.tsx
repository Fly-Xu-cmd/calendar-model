import { Calendar, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCalendarStore } from "@/stores/calendarStore"
import { CalendarView } from "@/components/calendar/CalendarView"
import { ChatView } from "@/components/chat/ChatView"
import type { PageView } from "@/types"

const navItems: { id: PageView; label: string; icon: typeof Calendar }[] = [
  { id: "calendar", label: "日历", icon: Calendar },
  { id: "chat", label: "AI", icon: MessageSquare },
]

function App() {
  const pageView = useCalendarStore((s) => s.pageView)
  const setPageView = useCalendarStore((s) => s.setPageView)

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* left sidebar */}
      <aside className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-border bg-stone-50/80 pt-5 pb-4">
        <div className="mb-4 text-lg">📅</div>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPageView(id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 w-12 text-[10px] font-medium transition-all",
              pageView === id
                ? "bg-amber-100 text-amber-800"
                : "text-stone-400 hover:text-stone-600 hover:bg-stone-100",
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </aside>

      {/* right main content */}
      <main className="flex-1 min-w-0 overflow-hidden">
        {pageView === "calendar" && <CalendarView />}
        {pageView === "chat" && <ChatView />}
      </main>
    </div>
  )
}

export default App
