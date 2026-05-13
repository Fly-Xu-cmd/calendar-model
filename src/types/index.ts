export interface ListingItem {
  address: string
  price: string
  beds: number
  baths: number
  daysOnMarket: number
}

export interface EmailDraft {
  id: string
  to: string
  subject: string
  preview: string
  selected: boolean
}

export interface AiEventContent {
  marketOverview: string
  medianPrice: string
  priceChange: string
  inventory: number
  newListings: number
  listings: ListingItem[]
  linkedinDraft: string
  emailDrafts: EmailDraft[]
}

export type EventStatus = "draft" | "confirmed" | "auto-published" | "skipped"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  color: string
  tags?: string[]
  status?: EventStatus
  aiContent?: AiEventContent
  isAiGenerated?: boolean
  chatSessionId?: string
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  step: number
  branch: string
  isTyping: boolean
  linkedEventIds: string[]
  createdAt: Date
}

export type PageView = "calendar" | "chat"

export type TrustMode = "confirm" | "auto"

export type ChatRole = "user" | "assistant"

export interface SubProcess {
  id: string
  title: string
  status: "running" | "done" | "error"
  detail?: string
  children?: SubProcess[]
}

export interface ChatAction {
  id: string
  label: string
  variant: "primary" | "secondary"
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
