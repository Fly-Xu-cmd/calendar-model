import { create } from "zustand"
import { format, addDays, addWeeks, subWeeks } from "date-fns"
import type { CalendarEvent, PageView, TrustMode, AiEventContent, EventPlan } from "@/types"
import { useChatStore } from "./chatStore"

interface CalendarState {
  currentDate: Date
  events: CalendarEvent[]
  pageView: PageView
  selectedEventId: string | null
  floatingEventIds: string[]
  trustMode: TrustMode
  editingLinkedin: boolean
  editedLinkedinDraft: string
  streamingEventId: string | null

  setCurrentDate: (date: Date) => void
  setPageView: (view: PageView) => void
  nextWeek: () => void
  prevWeek: () => void
  addEvent: (event: CalendarEvent) => void
  removeEvent: (id: string) => void
  selectEvent: (id: string | null) => void
  openFloating: (id: string) => void
  closeFloating: (id?: string) => void
  confirmEvent: (id: string) => void
  skipEvent: (id: string) => void
  setTrustMode: (mode: TrustMode) => void
  toggleEmailSelected: (eventId: string, emailId: string) => void
  setEditingLinkedin: (editing: boolean) => void
  setEditedLinkedinDraft: (draft: string) => void
  confirmWithEdit: (id: string, newDraft: string) => void
  updateEventAiContent: (id: string, partial: Partial<AiEventContent>) => void
  setStreamingEventId: (id: string | null) => void
  createPlaceholderEvents: () => void
  fillEventContent: (eventId?: string) => void
  createRecurringEvents: () => void
  streamAiEvents: () => void
}

const today = new Date()
const fmt = (d: Date) => format(d, "yyyy-MM-dd")
const todayStr = fmt(today)
const dayOfWeek = today.getDay()
const mondayBased = dayOfWeek === 0 ? 6 : dayOfWeek - 1

const defaultPlan: EventPlan = {
  schedule: "每天 9:00 AM",
  steps: [
    "抓取富兰克林县当日新上市的独栋住宅（$200k-$400k）",
    "汇总哥伦布市整体市场数据（中位价、库存、趋势）",
    "用你的风格生成一篇 LinkedIn 帖子草稿",
    "为每套新房源生成一封个性化推广邮件草稿",
    "将以上内容推送到你的日历",
  ],
  filters: {
    "房产类型": "独栋住宅",
    "价格区间": "$200k - $400k",
    "区域": "Franklin County, OH",
  },
}

const personalEvents: CalendarEvent[] = [
  {
    id: "personal-1",
    title: "带看 Worthington 房源",
    date: todayStr,
    startTime: "10:00",
    endTime: "11:00",
    color: "blue",
    tags: ["带看"],
  },
  {
    id: "personal-2",
    title: "签约会议 — Johnson 家庭",
    date: todayStr,
    startTime: "14:00",
    endTime: "15:30",
    color: "purple",
    tags: ["签约"],
  },
  {
    id: "personal-3",
    title: "团队周会",
    date: fmt(addDays(today, 1)),
    startTime: "11:00",
    endTime: "12:00",
    color: "blue",
    tags: ["Keller Williams"],
  },
]

export const aiEventsData: CalendarEvent[] = [
  ...(mondayBased >= 1
    ? [
        {
          id: "ai-yesterday",
          title: "今日市场速报 — 已自动发布 ✅",
          date: fmt(addDays(today, -1)),
          startTime: "09:00",
          endTime: "09:30",
          color: "green" as const,
          tags: ["LinkedIn 帖子已发", "2 封邮件已发"],
          status: "auto-published" as const,
          isAiGenerated: true,
          plan: defaultPlan,
          aiContent: {
            marketOverview: "昨日市场稳定，2 套新增房源已自动推广。",
            medianPrice: "$285,000",
            priceChange: "↑0.8%",
            inventory: 340,
            newListings: 2,
            listings: [
              { address: "320 Oakland Park Ave", price: "$275,000", beds: 3, baths: 2, daysOnMarket: 2 },
              { address: "1560 Bryden Rd", price: "$230,000", beds: 3, baths: 1.5, daysOnMarket: 2 },
            ],
            linkedinDraft:
              "哥伦布的朋友们，Oakland Park 那边出了套很有意思的房子 🏡 3居室 $275k，社区成熟，步行可到公园。Bryden Rd 也有套 $230k 的——首次购房者可以认真看看。市场不等人，有问题随时问我👇",
            emailDrafts: [
              { id: "email-y1", to: "Lisa Wang", subject: "Oakland Park Ave 新房源推荐", preview: "Hi Lisa，320 Oakland Park Ave 3 居室 $275k……", selected: true },
              { id: "email-y2", to: "Tom Brown", subject: "Bryden Rd 入门级房源", preview: "Hi Tom，1560 Bryden Rd $230k，适合首次购房……", selected: true },
            ],
          },
        },
      ]
    : []),
  {
    id: "ai-today",
    title: "哥伦布今日市场速报 — 富兰克林县 3 套新房源",
    date: todayStr,
    startTime: "09:00",
    endTime: "09:30",
    color: "blue",
    tags: ["自动生成", "待你确认"],
    status: "draft",
    isAiGenerated: true,
    plan: defaultPlan,
    aiContent: {
      marketOverview: "富兰克林县独栋住宅市场活跃，新增 3 套房源进入目标价位区间。买家竞争加剧，平均 DOM 缩短至 18 天。",
      medianPrice: "$287,500",
      priceChange: "↑1.2%",
      inventory: 342,
      newListings: 3,
      listings: [
        { address: "1847 Summit St", price: "$265,000", beds: 3, baths: 2, daysOnMarket: 1 },
        { address: "923 E Broad St", price: "$310,000", beds: 4, baths: 2.5, daysOnMarket: 1 },
        { address: "4501 Refugee Rd", price: "$189,000", beds: 2, baths: 1, daysOnMarket: 1 },
      ],
      linkedinDraft:
        "你们有没有注意到最近 Clintonville 的房子上得越来越快了？🏠 今天富兰克林县又多了三套独栋——Summit St 那套 $265k，三居室，对年轻家庭来说真的很 solid。想知道现在入手的时机对不对？来聊👇",
      emailDrafts: [
        { id: "email-1", to: "Sarah Martinez", subject: "🏠 Summit St 新房源 — 符合您的需求", preview: "Hi Sarah，1847 Summit St 今天刚上市，3 居室 $265k，Clintonville 学区……", selected: true },
        { id: "email-2", to: "David Chen", subject: "刚上市：E Broad St 4居室独栋", preview: "Hi David，923 E Broad St 今天上市，4 居室 2.5 卫，$310k……", selected: true },
        { id: "email-3", to: "Mike Johnson", subject: "Refugee Rd 超值房源 $189k", preview: "Hi Mike，4501 Refugee Rd 今天上市，2 居室 $189k，入门级好选择……", selected: true },
      ],
    },
  },
  {
    id: "ai-tomorrow",
    title: "哥伦布今日市场 — 无新增独栋住宅",
    date: fmt(addDays(today, 1)),
    startTime: "09:00",
    endTime: "09:30",
    color: "blue",
    tags: ["自动生成", "待你确认"],
    status: "draft",
    isAiGenerated: true,
    plan: defaultPlan,
    aiContent: {
      marketOverview: "今日富兰克林县目标价位区间内无新增独栋住宅。市场整体库存微降，中位价小幅回调。",
      medianPrice: "$289,000",
      priceChange: "↓0.3%",
      inventory: 338,
      newListings: 0,
      listings: [],
      linkedinDraft:
        `哥伦布今天没有新上的房子，但这不代表市场在休息 📊 富兰克林县的库存降到了 338 套，比上周少了 4 套。如果你一直在等那个"完美时机"——市场正在慢慢收紧。想聊聊现在的策略？DM 我👇`,
      emailDrafts: [],
    },
  },
  {
    id: "ai-day3",
    title: "哥伦布今日市场速报 — 富兰克林县 5 套新房源",
    date: fmt(addDays(today, 2)),
    startTime: "09:00",
    endTime: "09:30",
    color: "blue",
    tags: ["自动生成", "待你确认"],
    status: "draft",
    isAiGenerated: true,
    plan: defaultPlan,
    aiContent: {
      marketOverview: "本周新增房源量创新高，5 套独栋住宅进入目标区间，其中 2 套位于热门学区。",
      medianPrice: "$291,000",
      priceChange: "↑2.1%",
      inventory: 345,
      newListings: 5,
      listings: [
        { address: "2150 N High St", price: "$298,000", beds: 3, baths: 2, daysOnMarket: 1 },
        { address: "845 Indianola Ave", price: "$275,000", beds: 3, baths: 1.5, daysOnMarket: 1 },
        { address: "3901 Karl Rd", price: "$210,000", beds: 3, baths: 1, daysOnMarket: 1 },
        { address: "1277 Genessee Ave", price: "$325,000", beds: 4, baths: 2, daysOnMarket: 1 },
        { address: "560 Walhalla Rd", price: "$195,000", beds: 2, baths: 1, daysOnMarket: 1 },
      ],
      linkedinDraft:
        "周中爆发！🔥 今天富兰克林县一口气多了 5 套独栋——N High St 那套 $298k 是 Clintonville 学区，Indianola Ave 的 $275k 也很抢手。这周的市场节奏明显在加快，库存 345 套但消化速度也快。你在关注哪个区域？评论区告诉我👇",
      emailDrafts: [
        { id: "email-d3-1", to: "Sarah Martinez", subject: "N High St 学区房推荐", preview: "Hi Sarah，2150 N High St……", selected: true },
        { id: "email-d3-2", to: "David Chen", subject: "Indianola Ave 新上市", preview: "Hi David，845 Indianola……", selected: true },
        { id: "email-d3-3", to: "Lisa Wang", subject: "Karl Rd 高性价比房源", preview: "Hi Lisa，3901 Karl Rd $210k……", selected: true },
        { id: "email-d3-4", to: "Jennifer Liu", subject: "Genessee Ave 4居室", preview: "Hi Jennifer，1277 Genessee……", selected: true },
        { id: "email-d3-5", to: "Mike Johnson", subject: "Walhalla Rd 入门好选择", preview: "Hi Mike，560 Walhalla Rd $195k……", selected: true },
      ],
    },
  },
]

function streamText(
  fullText: string,
  onUpdate: (partial: string) => void,
  intervalMs = 30,
): Promise<void> {
  return new Promise((resolve) => {
    let idx = 0
    const timer = setInterval(() => {
      const chunkSize = Math.floor(Math.random() * 3) + 1
      idx = Math.min(idx + chunkSize, fullText.length)
      onUpdate(fullText.slice(0, idx))
      if (idx >= fullText.length) {
        clearInterval(timer)
        resolve()
      }
    }, intervalMs)
  })
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentDate: today,
  events: personalEvents,
  pageView: "calendar",
  selectedEventId: null,
  floatingEventIds: [],
  trustMode: "confirm",
  editingLinkedin: false,
  editedLinkedinDraft: "",
  streamingEventId: null,

  setCurrentDate: (date) => set({ currentDate: date }),
  setPageView: (view) => set({ pageView: view }),
  nextWeek: () => set((s) => ({ currentDate: addWeeks(s.currentDate, 1) })),
  prevWeek: () => set((s) => ({ currentDate: subWeeks(s.currentDate, 1) })),
  addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
  removeEvent: (id) =>
    set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

  selectEvent: (id) => {
    const ev = id ? get().events.find((e) => e.id === id) : null
    set({
      selectedEventId: id,
      editingLinkedin: false,
      editedLinkedinDraft: ev?.aiContent?.linkedinDraft ?? "",
    })
    if (ev?.isAiGenerated && ev.chatSessionId) {
      useChatStore.getState().switchSession(ev.chatSessionId)
    }
  },

  openFloating: (id) => {
    const MAX_STACK = 5
    const ev = get().events.find((e) => e.id === id)
    const current = get().floatingEventIds
    const filtered = current.filter((eid) => eid !== id)
    const trimmed = filtered.length >= MAX_STACK ? filtered.slice(filtered.length - MAX_STACK + 1) : filtered
    set({ floatingEventIds: [...trimmed, id], selectedEventId: id })
    if (ev?.chatSessionId) {
      useChatStore.getState().switchSession(ev.chatSessionId)
    } else if (ev?.isAiGenerated) {
      const sessionId = useChatStore.getState().createSession()
      set((s) => ({
        events: s.events.map((e) =>
          e.id === id ? { ...e, chatSessionId: sessionId } : e,
        ),
      }))
    }
  },

  closeFloating: (id) => {
    if (id) {
      set((s) => ({ floatingEventIds: s.floatingEventIds.filter((eid) => eid !== id) }))
    } else {
      set((s) => ({ floatingEventIds: s.floatingEventIds.slice(0, -1) }))
    }
  },

  updateEventAiContent: (id, partial) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === id && e.aiContent
          ? { ...e, aiContent: { ...e.aiContent, ...partial } }
          : e,
      ),
    })),

  setStreamingEventId: (id) => set({ streamingEventId: id }),

  createPlaceholderEvents: () => {
    const chatSessionId = useChatStore.getState().activeSessionId
    if (!chatSessionId) return
    const eventId = `agent-${chatSessionId}`
    if (get().events.find((e) => e.id === eventId)) return
    const todayEvent = aiEventsData.find((e) => e.id === "ai-today")
    if (!todayEvent) return
    const placeholder: CalendarEvent = {
      id: eventId,
      title: todayEvent.date,
      date: todayEvent.date,
      startTime: todayEvent.startTime,
      endTime: todayEvent.endTime,
      color: "blue",
      status: "loading" as const,
      isAiGenerated: true,
      chatSessionId,
      tags: ["正在准备…"],
    }
    set((s) => ({ events: [...s.events, placeholder] }))
  },

  fillEventContent: (passedEventId?: string) => {
    const targetId = passedEventId ?? (() => {
      const sid = useChatStore.getState().activeSessionId
      return sid ? `agent-${sid}` : null
    })()
    if (!targetId) return
    const template = aiEventsData.find((e) => e.id === "ai-today")
    if (!template) return

    setTimeout(() => {
      set((s) => ({
        streamingEventId: targetId,
        selectedEventId: targetId,
        events: s.events.map((e) =>
          e.id === targetId
            ? {
                ...e,
                title: template.title,
                tags: template.tags,
                plan: template.plan,
                aiContent: template.aiContent
                  ? { marketOverview: "", medianPrice: "", priceChange: "", inventory: 0, newListings: 0, listings: [], linkedinDraft: "", emailDrafts: [] }
                  : undefined,
              }
            : e,
        ),
      }))

      if (template.aiContent) {
        const ai = template.aiContent
        const streamSteps = async () => {
          await streamText(ai.marketOverview, (t) =>
            get().events.find(e => e.id === targetId) &&
            set((s) => ({ events: s.events.map((e) => e.id === targetId ? { ...e, aiContent: { ...e.aiContent!, marketOverview: t } } : e) })),
          )
          set((s) => ({ events: s.events.map((e) => e.id === targetId ? { ...e, aiContent: { ...e.aiContent!, medianPrice: ai.medianPrice, priceChange: ai.priceChange, inventory: ai.inventory, newListings: ai.newListings } } : e) }))
          await new Promise((r) => setTimeout(r, 200))
          for (const listing of ai.listings) {
            set((s) => ({ events: s.events.map((e) => e.id === targetId ? { ...e, aiContent: { ...e.aiContent!, listings: [...e.aiContent!.listings, listing] } } : e) }))
            await new Promise((r) => setTimeout(r, 150))
          }
          await streamText(ai.linkedinDraft, (t) =>
            get().events.find(e => e.id === targetId) &&
            set((s) => ({ events: s.events.map((e) => e.id === targetId ? { ...e, aiContent: { ...e.aiContent!, linkedinDraft: t } } : e) })),
          )
          for (const email of ai.emailDrafts) {
            set((s) => ({ events: s.events.map((e) => e.id === targetId ? { ...e, aiContent: { ...e.aiContent!, emailDrafts: [...e.aiContent!.emailDrafts, email] } } : e) }))
            await new Promise((r) => setTimeout(r, 100))
          }
          set((s) => ({
            events: s.events.map((e) => e.id === targetId ? { ...e, status: template.status ?? ("draft" as const), tags: template.tags } : e),
            streamingEventId: null,
            editedLinkedinDraft: get().selectedEventId === targetId ? ai.linkedinDraft : get().editedLinkedinDraft,
          }))
        }
        streamSteps()
      }
    }, 200)
  },

  createRecurringEvents: () => {
    const chatSessionId = useChatStore.getState().activeSessionId
    if (!chatSessionId) return
    const futureEvents = aiEventsData.filter((e) => e.id !== "ai-today" && e.id !== "ai-yesterday")
    const newEvents: CalendarEvent[] = futureEvents.map((ev) => ({
      ...ev,
      id: `${ev.id}-${chatSessionId}`,
      chatSessionId,
      plan: ev.plan,
      status: undefined,
      aiContent: undefined,
      tags: ["计划中"],
      title: "市场速报 — 待运行",
    }))
    set((s) => ({ events: [...s.events, ...newEvents] }))
  },

  streamAiEvents: () => {
    const events = aiEventsData
    const chatSessionId = useChatStore.getState().activeSessionId

    const placeholders: CalendarEvent[] = events.map((fullEvent) => ({
      ...fullEvent,
      chatSessionId: chatSessionId ?? undefined,
      status: "loading" as const,
      tags: ["正在准备…"],
      aiContent: fullEvent.aiContent
        ? {
            marketOverview: "",
            medianPrice: "",
            priceChange: "",
            inventory: 0,
            newListings: 0,
            listings: [],
            linkedinDraft: "",
            emailDrafts: [],
          }
        : undefined,
    }))

    set((s) => ({
      events: [...s.events, ...placeholders],
      selectedEventId: events[0]?.id ?? null,
      editingLinkedin: false,
      editedLinkedinDraft: "",
    }))

    let delay = 300

    events.forEach((fullEvent, idx) => {
      const d = delay

      setTimeout(() => {
        set(() => ({
          streamingEventId: fullEvent.id,
          selectedEventId: fullEvent.id,
        }))

        if (fullEvent.aiContent) {
          const ai = fullEvent.aiContent

          const streamSteps = async () => {
            await streamText(ai.marketOverview, (t) =>
              get().events.find(e => e.id === fullEvent.id) &&
              set((s) => ({
                events: s.events.map((e) =>
                  e.id === fullEvent.id
                    ? { ...e, aiContent: { ...e.aiContent!, marketOverview: t } }
                    : e,
                ),
              })),
            )

            set((s) => ({
              events: s.events.map((e) =>
                e.id === fullEvent.id
                  ? {
                      ...e,
                      aiContent: {
                        ...e.aiContent!,
                        medianPrice: ai.medianPrice,
                        priceChange: ai.priceChange,
                        inventory: ai.inventory,
                        newListings: ai.newListings,
                      },
                    }
                  : e,
              ),
            }))

            await new Promise((r) => setTimeout(r, 200))

            for (const listing of ai.listings) {
              set((s) => ({
                events: s.events.map((e) =>
                  e.id === fullEvent.id
                    ? {
                        ...e,
                        aiContent: {
                          ...e.aiContent!,
                          listings: [...e.aiContent!.listings, listing],
                        },
                      }
                    : e,
                ),
              }))
              await new Promise((r) => setTimeout(r, 150))
            }

            await streamText(ai.linkedinDraft, (t) =>
              get().events.find(e => e.id === fullEvent.id) &&
              set((s) => ({
                events: s.events.map((e) =>
                  e.id === fullEvent.id
                    ? { ...e, aiContent: { ...e.aiContent!, linkedinDraft: t } }
                    : e,
                ),
              })),
            )

            for (const email of ai.emailDrafts) {
              set((s) => ({
                events: s.events.map((e) =>
                  e.id === fullEvent.id
                    ? {
                        ...e,
                        aiContent: {
                          ...e.aiContent!,
                          emailDrafts: [...e.aiContent!.emailDrafts, email],
                        },
                      }
                    : e,
                ),
              }))
              await new Promise((r) => setTimeout(r, 100))
            }

            set((s) => ({
              events: s.events.map((e) =>
                e.id === fullEvent.id
                  ? { ...e, status: fullEvent.status ?? ("draft" as const), tags: fullEvent.tags }
                  : e,
              ),
            }))

            if (idx === events.length - 1) {
              set({ streamingEventId: null })
            }

            set((s) => ({
              editedLinkedinDraft:
                s.selectedEventId === fullEvent.id ? ai.linkedinDraft : s.editedLinkedinDraft,
            }))
          }

          streamSteps()
        }
      }, d)

      delay += 800
    })
  },

  confirmEvent: (id) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === id
          ? {
              ...e,
              status: "confirmed",
              tags: ["LinkedIn 帖子已发", `${e.aiContent?.emailDrafts.filter((d) => d.selected).length ?? 0} 封邮件已发`],
              title: e.title.replace("待你确认", "").replace("新房源", "新房源 ✅").trim(),
            }
          : e,
      ),
    })),

  skipEvent: (id) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === id
          ? { ...e, status: "skipped", tags: ["已跳过"] }
          : e,
      ),
    })),

  setTrustMode: (mode) =>
    set((s) => ({
      trustMode: mode,
      events: s.events.map((e) => {
        if (!e.isAiGenerated) return e
        if (mode === "auto" && e.status === "draft") {
          return {
            ...e,
            status: "auto-published" as const,
            tags: ["LinkedIn 帖子已发", `${e.aiContent?.emailDrafts.length ?? 0} 封邮件已发`],
            title: e.title.includes("无新增")
              ? "今日市场速报 — 已自动发布 ✅"
              : `今日市场速报 — ${e.aiContent?.newListings ?? 0} 套新房源 · 已自动发布 ✅`,
          }
        }
        if (mode === "confirm" && e.status === "auto-published") {
          return {
            ...e,
            status: "draft" as const,
            tags: ["自动生成", "待你确认"],
            title: e.aiContent?.newListings
              ? `哥伦布今日市场速报 — 富兰克林县 ${e.aiContent.newListings} 套新房源`
              : "哥伦布今日市场 — 无新增独栋住宅",
          }
        }
        return e
      }),
    })),

  toggleEmailSelected: (eventId, emailId) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === eventId && e.aiContent
          ? {
              ...e,
              aiContent: {
                ...e.aiContent,
                emailDrafts: e.aiContent.emailDrafts.map((d) =>
                  d.id === emailId ? { ...d, selected: !d.selected } : d,
                ),
              },
            }
          : e,
      ),
    })),

  setEditingLinkedin: (editing) => set({ editingLinkedin: editing }),
  setEditedLinkedinDraft: (draft) => set({ editedLinkedinDraft: draft }),

  confirmWithEdit: (id, newDraft) =>
    set((s) => ({
      editingLinkedin: false,
      events: s.events.map((e) =>
        e.id === id
          ? {
              ...e,
              status: "confirmed" as const,
              tags: ["LinkedIn 帖子已发", `${e.aiContent?.emailDrafts.filter((d) => d.selected).length ?? 0} 封邮件已发`],
              title: e.title.replace("待你确认", "").trim() + " ✅",
              aiContent: e.aiContent
                ? { ...e.aiContent, linkedinDraft: newDraft }
                : e.aiContent,
            }
          : e,
      ),
    })),
}))
