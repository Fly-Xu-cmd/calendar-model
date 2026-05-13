import { useState } from "react"
import {
  Plus,
  Clock,
  Check,
  Trash2,
  AlertCircle,
  Filter,
  CalendarDays,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Priority = "high" | "medium" | "low"

interface TaskItem {
  id: string
  title: string
  description?: string
  priority: Priority
  dueLabel?: string
  done: boolean
  category: string
}

const initialTasks: TaskItem[] = [
  {
    id: "t1",
    title: "联系 Summit St 房源卖家",
    description: "确认 1847 Summit St 的看房时间安排，卖家要求周末前回复。",
    priority: "high",
    dueLabel: "今天",
    done: false,
    category: "跟进",
  },
  {
    id: "t2",
    title: "准备 Worthington 带看材料",
    description: "打印 CMA 报告，准备周边学区资料和近期成交数据。",
    priority: "high",
    dueLabel: "今天",
    done: false,
    category: "带看",
  },
  {
    id: "t3",
    title: "更新本周市场周报",
    description: "整理富兰克林县本周新增/撤回房源数据，撰写 LinkedIn 周报帖子。",
    priority: "medium",
    dueLabel: "周五",
    done: false,
    category: "内容",
  },
  {
    id: "t4",
    title: "回复客户 Johnson 的邮件",
    description: "Johnson 一家询问 Summit St 房源的学区归属和 HOA 费用。",
    priority: "medium",
    dueLabel: "明天",
    done: false,
    category: "跟进",
  },
  {
    id: "t5",
    title: "整理房源照片库",
    description: "上传上周拍摄的 Broad St 和 Refugee Rd 房源照片到系统。",
    priority: "low",
    done: false,
    category: "运营",
  },
  {
    id: "t6",
    title: "预约 923 E Broad St 拍照",
    description: "联系摄影师安排本周四下午拍摄。",
    priority: "medium",
    dueLabel: "周三",
    done: false,
    category: "运营",
  },
]

const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
  high: { label: "紧急", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900" },
  medium: { label: "中等", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900" },
  low: { label: "普通", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900" },
}

const categories = ["全部", "跟进", "带看", "内容", "运营"]

export function TaskView() {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [filterCategory, setFilterCategory] = useState("全部")

  const toggleDone = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  const removeTask = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id))

  const addTask = () => {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    setTasks((prev) => [
      {
        id: `t-${Date.now()}`,
        title: trimmed,
        priority: "medium",
        done: false,
        category: "跟进",
      },
      ...prev,
    ])
    setNewTitle("")
    setAdding(false)
  }

  const filtered = tasks.filter(
    (t) => filterCategory === "全部" || t.category === filterCategory
  )
  const pending = filtered.filter((t) => !t.done)
  const done = filtered.filter((t) => t.done)

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">任务管理</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {tasks.filter((t) => !t.done).length} 项待办 · {tasks.filter((t) => t.done).length} 项已完成
          </p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="size-3.5" />
          新建任务
        </Button>
      </div>

      {/* filter bar */}
      <div className="flex items-center gap-2 border-b border-border px-6 py-2">
        <Filter className="size-3.5 text-muted-foreground" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filterCategory === cat
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* task list */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-4 space-y-6">
          {/* add task input */}
          {adding && (
            <div className="flex gap-2 rounded-xl border border-border bg-card p-3">
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTask()
                  if (e.key === "Escape") setAdding(false)
                }}
                placeholder="输入任务名称..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button size="sm" onClick={addTask} disabled={!newTitle.trim()}>
                添加
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
                取消
              </Button>
            </div>
          )}

          {/* pending */}
          {pending.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                待办 ({pending.length})
              </h2>
              {pending.map((task) => {
                const prio = priorityConfig[task.priority]
                return (
                  <div
                    key={task.id}
                    className={cn(
                      "group flex gap-3 rounded-xl border p-4 transition-colors",
                      prio.bg
                    )}
                  >
                    <button
                      onClick={() => toggleDone(task.id)}
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 border-border hover:border-primary hover:bg-primary/10 transition-colors"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm text-foreground">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="outline" className={cn("text-[10px]", prio.color)}>
                            {prio.label}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {task.category}
                          </Badge>
                        </div>
                      </div>
                      {task.description && (
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-3">
                        {task.dueLabel && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {task.dueLabel}
                          </span>
                        )}
                        <button
                          onClick={() => removeTask(task.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                        >
                          <Trash2 className="size-3" />
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* done */}
          {done.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                已完成 ({done.length})
              </h2>
              {done.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3"
                >
                  <button
                    onClick={() => toggleDone(task.id)}
                    className="flex size-5 shrink-0 items-center justify-center rounded-md border-2 border-primary bg-primary/10"
                  >
                    <Check className="size-3 text-primary" />
                  </button>
                  <span className="flex-1 text-sm text-muted-foreground line-through">
                    {task.title}
                  </span>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {pending.length === 0 && done.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CalendarDays className="size-10 mb-3 opacity-30" />
              <p className="text-sm">该分类下没有任务</p>
            </div>
          )}

          {/* AI insight */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-foreground">AI 洞察</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  过去 3 天富兰克林县新房源数量下降 40%，市场可能进入观望期。建议在本周帖子中加入「趋势分析」角度。另外，Johnson 一家已两天未回复，建议今天优先跟进。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
