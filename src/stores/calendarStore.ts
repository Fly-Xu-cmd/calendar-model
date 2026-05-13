import { create } from "zustand"
import {
  addDays,
  startOfWeek,
  setHours,
  setMinutes,
} from "date-fns"
import type {
  CalendarEvent,
  CalendarViewMode,
  EventStatus,
} from "@/types"

export type NavSection = "calendar" | "tasks" | "settings"

interface CalendarState {
  currentDate: Date
  viewMode: CalendarViewMode
  events: CalendarEvent[]
  selectedEvent: CalendarEvent | null
  sidebarCollapsed: boolean
  rightPanelOpen: boolean
  activeNav: NavSection

  setCurrentDate: (date: Date) => void
  setViewMode: (mode: CalendarViewMode) => void
  selectEvent: (event: CalendarEvent | null) => void
  toggleSidebar: () => void
  toggleRightPanel: () => void
  setActiveNav: (nav: NavSection) => void
  updateEventStatus: (id: string, status: EventStatus) => void
  addEvent: (event: CalendarEvent) => void
  removeEvent: (id: string) => void
  markEmailSent: (eventId: string, emailId: string) => void
  markAllEmailsSent: (eventId: string) => void
  updateEventLinkedin: (eventId: string, draft: string) => void
}

function createMockEvents(): CalendarEvent[] {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })

  return [
    {
      id: "1",
      title: "哥伦布今日市场速报 — 富兰克林县 3 套新房源",
      description: "AI 自动生成 · 待你确认",
      startTime: setMinutes(setHours(weekStart, 9), 0),
      endTime: setMinutes(setHours(weekStart, 9), 30),
      status: "draft",
      color: "amber",
      marketData: {
        medianPrice: 287500,
        priceChange: 1.2,
        inventory: 342,
        newListings: 3,
        listings: [
          { address: "1847 Summit St", price: 265000, beds: 3, baths: 2, daysOnMarket: 1 },
          { address: "923 E Broad St", price: 310000, beds: 4, baths: 2.5, daysOnMarket: 1 },
          { address: "4501 Refugee Rd", price: 189000, beds: 2, baths: 1, daysOnMarket: 1 },
        ],
      },
      linkedinDraft:
        "你们有没有注意到最近 Clintonville 的房子上得越来越快了？🏠 今天富兰克林县又多了三套独栋——Summit St 那套 $265k，三居室，对年轻家庭来说真的很 solid。想知道现在入手的时机对不对？来聊👇",
      emailDrafts: [
        {
          id: "e1",
          recipient: "johnson.family@gmail.com",
          subject: "🏠 Summit St 新房源 — 符合你的需求",
          body: "Hi Johnson 一家，\n\n1847 Summit St 今天刚上市，3居室/2卫，$265,000。位于 Clintonville 核心区，步行可达学校和公园。我觉得非常适合你们的需求，建议尽早安排看房。\n\n有兴趣的话随时联系我！\n\nLauren",
          sent: false,
        },
        {
          id: "e2",
          recipient: "mike.chen@outlook.com",
          subject: "🏠 Broad St 新房源 — 投资机会",
          body: "Hi Mike，\n\n923 E Broad St 刚上市，4居室/2.5卫，$310,000。该区域租金回报率不错，作为投资房是个好选择。上市第一天，预计会比较抢手。\n\n需要我帮你跑一下 ROI 分析吗？\n\nLauren",
          sent: false,
        },
        {
          id: "e3",
          recipient: "sarah.w@yahoo.com",
          subject: "🏠 Refugee Rd 经济适用房源",
          body: "Hi Sarah，\n\n4501 Refugee Rd 今天上市，2居室/1卫，$189,000。价格在你的预算范围内，虽然面积不大但地段通勤方便。值得去实地看看。\n\n周末有空的话我可以安排带看。\n\nLauren",
          sent: false,
        },
      ],
    },
    {
      id: "2",
      title: "带看 Worthington 房产",
      startTime: setMinutes(setHours(weekStart, 10), 0),
      endTime: setMinutes(setHours(weekStart, 11), 0),
      status: "confirmed",
      color: "blue",
    },
    {
      id: "3",
      title: "签约会议",
      startTime: setMinutes(setHours(weekStart, 14), 0),
      endTime: setMinutes(setHours(weekStart, 15), 30),
      status: "confirmed",
      color: "blue",
    },
    {
      id: "4",
      title: "今日市场速报 — 已自动发布 ✅",
      description: "LinkedIn 帖子已发 · 3 封邮件已发",
      startTime: setMinutes(setHours(addDays(weekStart, 1), 9), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 1), 9), 30),
      status: "auto_published",
      color: "green",
    },
    {
      id: "5",
      title: "客户电话 — Smith 家庭",
      startTime: setMinutes(setHours(addDays(weekStart, 1), 11), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 1), 12), 0),
      status: "confirmed",
      color: "blue",
    },
    {
      id: "6",
      title: "哥伦布市场速报 — 无新增独栋住宅",
      description: "市场趋势分析 · 待确认",
      startTime: setMinutes(setHours(addDays(weekStart, 2), 9), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 2), 9), 30),
      status: "draft",
      color: "amber",
      linkedinDraft:
        "哥伦布的各位，虽然今天富兰克林县没有新房源上市，但市场数据值得关注📊 中位价 $289,000，周环比微降 0.3%……",
    },
    {
      id: "7",
      title: "团队周会",
      startTime: setMinutes(setHours(addDays(weekStart, 3), 10), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 3), 11), 0),
      status: "confirmed",
      color: "purple",
    },
    {
      id: "8",
      title: "市场速报 — 2 套新房源",
      description: "AI 自动生成 · 待确认",
      startTime: setMinutes(setHours(addDays(weekStart, 4), 9), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 4), 9), 30),
      status: "draft",
      color: "amber",
    },
    {
      id: "9",
      title: "Open House — 923 E Broad St",
      startTime: setMinutes(setHours(addDays(weekStart, 5), 13), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 5), 16), 0),
      status: "confirmed",
      color: "blue",
    },
  ]
}

export const useCalendarStore = create<CalendarState>((set) => ({
  currentDate: new Date(),
  viewMode: "week",
  events: createMockEvents(),
  selectedEvent: null,
  sidebarCollapsed: false,
  rightPanelOpen: false,
  activeNav: "calendar",

  setCurrentDate: (date) => set({ currentDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),
  selectEvent: (event) => set({ selectedEvent: event }),
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleRightPanel: () =>
    set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setActiveNav: (nav) => set({ activeNav: nav }),
  updateEventStatus: (id, status) =>
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? { ...e, status } : e)),
    })),
  addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
  removeEvent: (id) =>
    set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
  markEmailSent: (eventId, emailId) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === eventId && e.emailDrafts
          ? {
              ...e,
              emailDrafts: e.emailDrafts.map((d) =>
                d.id === emailId ? { ...d, sent: true } : d
              ),
            }
          : e
      ),
    })),
  markAllEmailsSent: (eventId) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === eventId && e.emailDrafts
          ? { ...e, emailDrafts: e.emailDrafts.map((d) => ({ ...d, sent: true })) }
          : e
      ),
    })),
  updateEventLinkedin: (eventId, draft: string) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === eventId ? { ...e, linkedinDraft: draft } : e
      ),
    })),
}))
