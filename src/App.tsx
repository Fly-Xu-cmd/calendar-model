import { PanelRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/Sidebar"
import { RightPanel } from "@/components/layout/RightPanel"
import { WeekView } from "@/components/calendar/WeekView"
import { DayView } from "@/components/calendar/DayView"
import { TaskView } from "@/components/tasks/TaskView"
import { FloatingAgent } from "@/components/agent/FloatingAgent"
import { useCalendarStore } from "@/stores/calendarStore"

function App() {
  const activeNav = useCalendarStore((s) => s.activeNav)
  const viewMode = useCalendarStore((s) => s.viewMode)
  const rightPanelOpen = useCalendarStore((s) => s.rightPanelOpen)
  const toggleRightPanel = useCalendarStore((s) => s.toggleRightPanel)

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden">
        {activeNav === "calendar" && (
          <>
            <div className="flex items-center justify-end border-b border-border px-4 py-2">
              {!rightPanelOpen && (
                <Button variant="ghost" size="icon-sm" onClick={toggleRightPanel}>
                  <PanelRight className="size-4" />
                </Button>
              )}
            </div>
            {viewMode === "week" && <WeekView />}
            {viewMode === "day" && <DayView />}
            {viewMode === "month" && (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                <p className="text-sm">月视图（开发中）</p>
              </div>
            )}
          </>
        )}

        {activeNav === "tasks" && <TaskView />}

        {activeNav === "settings" && (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <p className="text-sm">偏好设置页面（开发中）</p>
          </div>
        )}
      </main>

      {activeNav === "calendar" && <RightPanel />}

      <FloatingAgent />
    </div>
  )
}

export default App
