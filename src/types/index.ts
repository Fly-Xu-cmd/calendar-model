export type EventStatus = "draft" | "confirmed" | "auto_published"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  status: EventStatus
  color?: string
  marketData?: MarketData
  linkedinDraft?: string
  emailDrafts?: EmailDraft[]
}

export interface MarketData {
  medianPrice: number
  priceChange: number
  inventory: number
  newListings: number
  listings: Listing[]
}

export interface Listing {
  address: string
  price: number
  beds: number
  baths: number
  daysOnMarket: number
}

export interface EmailDraft {
  id: string
  recipient: string
  subject: string
  body: string
  sent: boolean
}

export type AgentState = "idle" | "input" | "active"

export type ChatRole = "user" | "assistant"

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  options?: ChatOption[]
  actionCard?: ActionCardData
  timestamp: Date
}

export interface ChatOption {
  id: string
  label: string
  icon?: string
  selected?: boolean
}

export interface ActionCardData {
  type: "market_report" | "linkedin_post" | "email_batch"
  title: string
  summary: string
  actions: ActionButton[]
}

export interface ActionButton {
  id: string
  label: string
  icon: string
  variant: "primary" | "secondary" | "ghost"
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  company: string
  region: string
  preferences: UserPreferences
}

export interface UserPreferences {
  autoPublish: boolean
  pushTime: string
  propertyTypes: string[]
  priceRange: { min: number; max: number }
  targetCounty: string
  linkedinConnected: boolean
  calendarConnected: boolean
}

export type CalendarViewMode = "day" | "week" | "month"

export interface SidebarNavItem {
  id: string
  label: string
  icon: string
  active?: boolean
}
