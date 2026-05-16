import { CalendarView } from "@/components/calendar/CalendarView"
import { ConversationPanel } from "@/components/conversation/ConversationPanel"
import { Sidebar } from "@/components/layout/Sidebar"
import { AgentsView } from "@/components/agents/AgentsView"
import { useCalendarStore } from "@/stores/calendarStore"

function App() {
  const sidebarType = useCalendarStore((s) => s.sidebarType)

  return (
    <div className="flex h-screen overflow-hidden bg-white text-foreground">
      <Sidebar />
      <div className="relative flex flex-1 min-w-0 flex-col overflow-hidden">
        <main className="flex-1 min-h-0 overflow-hidden">
          {sidebarType === "calendar" ? <CalendarView /> : <AgentsView />}
        </main>
        <ConversationPanel />
      </div>
    </div>
  )
}

export default App
