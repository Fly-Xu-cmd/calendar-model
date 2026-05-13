import { useState } from "react"
import { X, Plus, Clock, AlertCircle, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCalendarStore } from "@/stores/calendarStore"

interface TaskItem {
  id: string
  title: string
  priority: "high" | "medium" | "low"
  dueLabel?: string
  done: boolean
}

const initialTasks: TaskItem[] = [
  { id: "t1", title: "联系 Summit St 房源卖家", priority: "high", dueLabel: "今天", done: false },
  { id: "t2", title: "准备 Worthington 带看材料", priority: "high", dueLabel: "今天", done: false },
  { id: "t3", title: "更新本周市场周报", priority: "medium", dueLabel: "周五", done: false },
  { id: "t4", title: "回复客户 Johnson 的邮件", priority: "medium", dueLabel: "明天", done: false },
  { id: "t5", title: "整理房源照片库", priority: "low", done: false },
]

const priorityStyles: Record<string, string> = {
  high: "border-l-red-400",
  medium: "border-l-amber-400",
  low: "border-l-blue-400",
}

export function RightPanel() {
  const { rightPanelOpen, toggleRightPanel } = useCalendarStore()
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [adding, setAdding] = useState(false)

  if (!rightPanelOpen) return null

  const toggleDone = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const addTask = () => {
    const trimmed = newTaskTitle.trim()
    if (!trimmed) return
    setTasks((prev) => [
      ...prev,
      {
        id: `t-${Date.now()}`,
        title: trimmed,
        priority: "medium",
        done: false,
      },
    ])
    setNewTaskTitle("")
    setAdding(false)
  }

  const pendingTasks = tasks.filter((t) => !t.done)
  const doneTasks = tasks.filter((t) => t.done)

  return (
    <div className="flex w-72 shrink-0 flex-col border-l border-border bg-muted/20">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">任务与线索池</h2>
        <Button variant="ghost" size="icon-sm" onClick={toggleRightPanel}>
          <X className="size-4" />
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="px-3 py-3 space-y-4">
          {/* pending tasks */}
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-xs font-medium text-muted-foreground">
                待办 ({pendingTasks.length})
              </h3>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setAdding(true)}
              >
                <Plus className="size-3" />
              </Button>
            </div>

            {adding && (
              <div className="mb-2 flex gap-1.5">
                <input
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTask()
                    if (e.key === "Escape") setAdding(false)
                  }}
                  placeholder="输入任务名称..."
                  className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring"
                />
                <Button size="icon-xs" onClick={addTask} disabled={!newTaskTitle.trim()}>
                  <Check className="size-3" />
                </Button>
              </div>
            )}

            <div className="space-y-1.5">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className={`group flex items-start gap-2 rounded-lg border-l-2 bg-card px-3 py-2 ${priorityStyles[task.priority]}`}
                >
                  <button
                    onClick={() => toggleDone(task.id)}
                    className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-border hover:border-primary hover:bg-primary/10 transition-colors"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{task.title}</p>
                    {task.dueLabel && (
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {task.dueLabel}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeTask(task.id)}
                  >
                    <Trash2 className="size-3 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <p className="px-1 text-xs text-muted-foreground">全部完成 🎉</p>
              )}
            </div>
          </div>

          {/* completed tasks */}
          {doneTasks.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 px-1 text-xs font-medium text-muted-foreground">
                  已完成 ({doneTasks.length})
                </h3>
                <div className="space-y-1">
                  {doneTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group flex items-center gap-2 rounded-lg px-3 py-1.5"
                    >
                      <button
                        onClick={() => toggleDone(task.id)}
                        className="flex size-4 shrink-0 items-center justify-center rounded border border-primary bg-primary/10"
                      >
                        <Check className="size-3 text-primary" />
                      </button>
                      <span className="flex-1 text-sm text-muted-foreground line-through">
                        {task.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeTask(task.id)}
                      >
                        <Trash2 className="size-3 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* ai insights */}
          <div>
            <h3 className="mb-2 px-1 text-xs font-medium text-muted-foreground">
              AI 洞察
            </h3>
            <div className="rounded-lg border border-border bg-card p-3 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  过去 3 天富兰克林县新房源数量下降 40%，市场可能进入观望期。建议在本周帖子中加入「趋势分析」角度。
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
