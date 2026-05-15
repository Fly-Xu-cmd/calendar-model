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

export type EventStatus = "loading" | "draft" | "confirmed" | "auto-published" | "skipped"

export type BuildPhaseStatus = "pending" | "running" | "auth-required" | "done" | "error" | "paused"

export interface BuildPhase {
  id: string
  title: string
  status: BuildPhaseStatus
  detail?: string
  children?: BuildPhase[]
  authType?: "oauth" | "domain"
  authLabel?: string
}

export interface EventPlan {
  schedule: string
  steps: string[]
  filters: Record<string, string>
}

export interface AgentInfo {
  id: string
  name: string
  seedText: string
  description: string
  isActive?: boolean
}

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
  plan?: EventPlan
  buildPhases?: BuildPhase[]
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  step: number
  branch: string
  isTyping: boolean
  linkedEventIds: string[]
  createdAt: Date
  focusedBuildEventId?: string | null
  expandedStepIndex?: number | null
  title?: string
}

export type PageView = "calendar" | "chat"

export type TrustMode = "confirm" | "auto"

export type ChatRole = "user" | "assistant" | "barrage"

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
  icon?: "build" | "task" | "info" | "auth" | "domain"
  stepIndex?: number
  inputPlaceholder?: string
  agentId?: string
  buildPhases?: BuildPhase[]
  isPaused?: boolean
}

export interface StepMeta {
  icon: string
  title: string
  completedSummary?: string
}
