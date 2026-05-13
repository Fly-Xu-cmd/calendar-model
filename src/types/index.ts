export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  color: "blue" | "amber" | "green" | "purple" | "red"
  tags?: string[]
}

export type PageView = "calendar" | "chat"

export type ChatRole = "user" | "assistant"

export interface SubProcess {
  id: string
  title: string
  status: "running" | "done" | "error"
  detail?: string
  children?: SubProcess[]
}

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: Date
  subProcesses?: SubProcess[]
  actions?: ChatAction[]
  icon?: "build" | "task" | "info"
}

export interface ChatAction {
  id: string
  label: string
  variant: "primary" | "secondary"
}
