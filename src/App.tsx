import { CalendarView } from "@/components/calendar/CalendarView"
import { ConversationPanel } from "@/components/conversation/ConversationPanel"

function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-white text-foreground">
      <div className="relative flex flex-1 min-w-0 flex-col overflow-hidden">
        <main className="flex-1 min-h-0 overflow-hidden">
          <CalendarView />
        </main>
        <ConversationPanel />
      </div>
    </div>
  )
}

export default App
