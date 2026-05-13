import { create } from "zustand"
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns"
import type { CalendarEvent, PageView } from "@/types"

interface CalendarState {
  currentDate: Date
  events: CalendarEvent[]
  pageView: PageView

  setCurrentDate: (date: Date) => void
  setPageView: (view: PageView) => void
  nextWeek: () => void
  prevWeek: () => void
  addEvent: (event: CalendarEvent) => void
  removeEvent: (id: string) => void
}

const today = new Date()
const ws = startOfWeek(today, { weekStartsOn: 1 })
const fmt = (d: Date) => format(d, "yyyy-MM-dd")

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "提取10条科技新闻并整理推送",
    date: fmt(addDays(ws, 2)),
    startTime: "09:00",
    endTime: "09:30",
    color: "amber",
    tags: ["待执行"],
  },
  {
    id: "2",
    title: "抓取哥伦布富兰克林县新房源并生成LinkedIn推广帖",
    date: fmt(addDays(ws, 2)),
    startTime: "09:00",
    endTime: "09:30",
    color: "amber",
    tags: ["待执行"],
  },
  {
    id: "3",
    title: "提取10条科技新闻并整理推送",
    date: fmt(addDays(ws, 3)),
    startTime: "09:00",
    endTime: "09:30",
    color: "amber",
    tags: ["待执行"],
  },
  {
    id: "4",
    title: "抓取哥伦布富兰克林县新房源并生成LinkedIn推广帖",
    date: fmt(addDays(ws, 3)),
    startTime: "09:00",
    endTime: "09:30",
    color: "amber",
    tags: ["待执行"],
  },
  {
    id: "5",
    title: "提取10条科技新闻并整理推送",
    date: fmt(addDays(ws, 4)),
    startTime: "09:00",
    endTime: "09:30",
    color: "amber",
    tags: ["待执行"],
  },
  {
    id: "6",
    title: "抓取哥伦布富兰克林县新房源并生成LinkedIn推广帖",
    date: fmt(addDays(ws, 4)),
    startTime: "09:00",
    endTime: "09:30",
    color: "amber",
    tags: ["待执行"],
  },
  {
    id: "7",
    title: "提取10条科技新闻并整理推送",
    date: fmt(addDays(ws, 5)),
    startTime: "09:00",
    endTime: "09:30",
    color: "amber",
    tags: ["待执行"],
  },
  {
    id: "8",
    title: "抓取哥伦布富兰克林县新房源并生成LinkedIn推广帖",
    date: fmt(addDays(ws, 5)),
    startTime: "09:00",
    endTime: "09:30",
    color: "amber",
    tags: ["待执行"],
  },
  {
    id: "9",
    title: "提取10条科技新闻并整理推送",
    date: fmt(addDays(ws, 6)),
    startTime: "09:00",
    endTime: "09:30",
    color: "amber",
    tags: ["待执行"],
  },
  {
    id: "10",
    title: "抓取哥伦布富兰克林县新房源并生成LinkedIn推广帖",
    date: fmt(addDays(ws, 6)),
    startTime: "09:00",
    endTime: "09:30",
    color: "amber",
    tags: ["待执行"],
  },
]

export const useCalendarStore = create<CalendarState>((set) => ({
  currentDate: today,
  events: mockEvents,
  pageView: "calendar",

  setCurrentDate: (date) => set({ currentDate: date }),
  setPageView: (view) => set({ pageView: view }),
  nextWeek: () => set((s) => ({ currentDate: addWeeks(s.currentDate, 1) })),
  prevWeek: () => set((s) => ({ currentDate: subWeeks(s.currentDate, 1) })),
  addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
  removeEvent: (id) =>
    set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
}))
