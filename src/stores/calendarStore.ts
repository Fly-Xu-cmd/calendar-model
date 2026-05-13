import { create } from "zustand"
import { format, addDays } from "date-fns"
import type { CalendarEvent, PageView } from "@/types"

interface CalendarState {
  currentDate: Date
  events: CalendarEvent[]
  pageView: PageView

  setCurrentDate: (date: Date) => void
  setPageView: (view: PageView) => void
  addEvent: (event: CalendarEvent) => void
  removeEvent: (id: string) => void
}

const today = new Date()
const fmt = (d: Date) => format(d, "yyyy-MM-dd")

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "哥伦布市场速报 — 3 套新房源",
    description: "AI 自动生成的每日市场分析，已推送至 LinkedIn。",
    date: fmt(today),
    startTime: "09:00",
    endTime: "09:30",
    color: "green",
    tags: ["AI 生成", "已发布"],
  },
  {
    id: "2",
    title: "带看 Worthington 房产",
    description: "客户 Johnson 一家，3 居室独栋住宅。",
    date: fmt(today),
    startTime: "10:00",
    endTime: "11:00",
    color: "blue",
    tags: ["带看"],
  },
  {
    id: "3",
    title: "签约会议",
    description: "923 E Broad St 购房合同签署。",
    date: fmt(today),
    startTime: "14:00",
    endTime: "15:30",
    color: "purple",
    tags: ["会议"],
  },
  {
    id: "4",
    title: "市场速报 — 无新增房源",
    description: "今日富兰克林县无新增独栋住宅，AI 已生成趋势分析帖。",
    date: fmt(addDays(today, 1)),
    startTime: "09:00",
    endTime: "09:30",
    color: "amber",
    tags: ["AI 生成", "待确认"],
  },
  {
    id: "5",
    title: "客户电话 — Smith 家庭",
    date: fmt(addDays(today, 1)),
    startTime: "11:00",
    endTime: "12:00",
    color: "blue",
    tags: ["跟进"],
  },
  {
    id: "6",
    title: "团队周会",
    date: fmt(addDays(today, 3)),
    startTime: "10:00",
    endTime: "11:00",
    color: "purple",
    tags: ["会议"],
  },
  {
    id: "7",
    title: "Open House — 923 E Broad St",
    description: "开放日看房活动，预计 10+ 组客户到访。",
    date: fmt(addDays(today, 5)),
    startTime: "13:00",
    endTime: "16:00",
    color: "blue",
    tags: ["活动"],
  },
]

export const useCalendarStore = create<CalendarState>((set) => ({
  currentDate: today,
  events: mockEvents,
  pageView: "calendar",

  setCurrentDate: (date) => set({ currentDate: date }),
  setPageView: (view) => set({ pageView: view }),
  addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
  removeEvent: (id) =>
    set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
}))
