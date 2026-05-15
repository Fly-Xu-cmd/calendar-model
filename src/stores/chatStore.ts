import { create } from "zustand"
import type { ChatMessage, ChatSession, StepMeta, BuildPhase } from "@/types"
import { useCalendarStore } from "./calendarStore"

type ChatBranch = "main" | "adjust-style" | "adjust-range" | "adjust-direction"

export const STEP_METAS: StepMeta[] = [
  { icon: "🏠", title: "房产类型" },
  { icon: "💰", title: "价格范围" },
  { icon: "📝", title: "风格参考" },
  { icon: "📋", title: "计划确认" },
  { icon: "🔨", title: "构建 Agent" },
  { icon: "✅", title: "配置完成" },
]

export const DEFAULT_BUILD_PHASES: BuildPhase[] = [
  {
    id: "bp1",
    title: "连接哥伦布房产数据源",
    status: "pending",
    detail: "已连接 Franklin County MLS 数据接口，数据延迟 < 15 分钟。",
  },
  {
    id: "bp2",
    title: "分析你的 5 篇 LinkedIn 帖子风格",
    status: "pending",
    detail: "风格摘要：开头反问句/数据引入，中间本地市场分析，结尾行动号召。语气专业且亲和，常用 emoji，第二人称拉近距离。",
  },
  {
    id: "bp3",
    title: "创建富兰克林县新房源监控",
    status: "pending",
    detail: "监控条件：独栋住宅，$200k-$400k，Franklin County，每日 8:30 AM 运行。",
    children: [
      { id: "bp3-1", title: "配置数据筛选规则", status: "pending", detail: "房产类型：Single Family\n价格区间：$200,000 - $400,000\n区域：Franklin County, OH" },
      { id: "bp3-2", title: "设置新房源变更检测", status: "pending" },
    ],
  },
  {
    id: "bp4",
    title: "LinkedIn 授权",
    status: "pending",
    authType: "oauth",
    authLabel: "授权 LinkedIn 发帖权限",
  },
  {
    id: "bp5",
    title: "域名授权",
    status: "pending",
    authType: "domain",
    authLabel: "授权你的域名用于邮件发送",
  },
  {
    id: "bp6",
    title: "日历授权",
    status: "pending",
    detail: "Notion Calendar 授权成功，已获得日程创建权限。",
  },
  {
    id: "bp7",
    title: "进行第一次试运行",
    status: "pending",
    children: [
      { id: "bp7-1", title: "抓取今日富兰克林县新增房源", status: "pending", detail: "今日新增 3 套独栋住宅（$200k-$400k 区间）。" },
      { id: "bp7-2", title: "生成 LinkedIn 帖子草稿", status: "pending", detail: "已用你的风格生成帖子草稿，包含今日市场数据和新房源亮点。" },
      { id: "bp7-3", title: "生成 3 封个性化推广邮件", status: "pending" },
      { id: "bp7-4", title: "写入日历日程事件", status: "pending" },
    ],
  },
]

export interface PendingAuth {
  phaseId: string
  eventId: string
  authType: "oauth" | "domain"
  label: string
  status: "waiting" | "authorizing" | "failed"
}

export interface ActiveBuild {
  eventId: string
  phases: BuildPhase[]
  paused: boolean
  pendingAuth?: PendingAuth | null
}

interface ChatState {
  sessions: Record<string, ChatSession>
  activeSessionId: string | null

  messages: ChatMessage[]
  inputValue: string
  isTyping: boolean
  step: number
  branch: ChatBranch
  expandedStepIndex: number | null
  activeBuilds: Record<string, ActiveBuild>
  pendingAuths: PendingAuth[]
  focusedBuildEventId: string | null

  buildPhases: BuildPhase[]
  buildPaused: boolean
  pendingAuth: PendingAuth | null

  setInputValue: (v: string) => void
  sendMessage: (content: string) => void
  resetChat: () => void
  createSession: () => string
  switchSession: (id: string) => void
  setExpandedStep: (idx: number | null) => void
  authorizeBuildPhase: (phaseId: string) => void
  cancelAuth: (phaseId: string) => void
  retryAuth: (phaseId: string) => void
  toggleBuildPause: () => void
  stopCurrentWork: () => void
  focusBuild: (eventId: string | null) => void
}

function detectBranch(content: string, currentStep: number): ChatBranch | null {
  if (currentStep < 4) return null
  const lower = content.toLowerCase()
  if (lower.includes("风格") || lower.includes("太书面") || lower.includes("不像我") || lower.includes("语气"))
    return "adjust-style"
  if (lower.includes("范围") || lower.includes("价格") || lower.includes("天内") || lower.includes("太多") || lower.includes("太少"))
    return "adjust-range"
  if (lower.includes("方向") || lower.includes("周报") || lower.includes("改成") || lower.includes("节奏"))
    return "adjust-direction"
  return null
}

function createReply(step: number, branch: ChatBranch): ChatMessage[] {
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

  if (branch === "adjust-style") {
    return [
      {
        id: `r-${Date.now()}-style`,
        role: "barrage",
        content:
          '收到，我重新分析了你最喜欢的第 3 篇和第 5 篇帖子。调整后的风格更口语化，多用 emoji 和第二人称。\n\n新版本：\n\n"你们有没有注意到最近 Clintonville 的房子上得越来越快了？🏠 今天富兰克林县又多了两套——Summit St 那套 $265k 真的值得去看看。想知道现在上车是不是好时机？来聊👇"',
        timestamp: new Date(),
        agentId: "style-agent",
        actions: [
          { id: "a-style-ok", label: "这个感觉对了", variant: "primary" },
          { id: "a-style-retry", label: "还是不太对，我再说说", variant: "secondary" },
        ],
      },
    ]
  }

  if (branch === "adjust-range") {
    return [
      {
        id: `r-${Date.now()}-range`,
        role: "barrage",
        content:
          "好的，已更新筛选条件：\n\n• 价格范围：**$150k - $400k**\n• 包含最近 **3 天内**上市且仍在售的房源\n\n按新条件重新运行，今日结果：**7 套房源**（比之前的 3 套多了 4 套）",
        timestamp: new Date(),
        agentId: "filter-agent",
        actions: [
          { id: "a-range-ok", label: "差不多了", variant: "primary" },
          { id: "a-range-more", label: "还是太多/太少", variant: "secondary" },
        ],
      },
    ]
  }

  if (branch === "adjust-direction") {
    return [
      {
        id: `r-${Date.now()}-dir`,
        role: "barrage",
        content:
          "明白，已调整节奏：\n\n**每天 9:00 AM**\n• 邮件汇总 + 日历事件（不发 LinkedIn）\n\n**每周一 9:00 AM**\n• 市场周报 + LinkedIn 帖子草稿\n\n其他设置保持不变（独栋住宅，$200k-$400k，Franklin County）。",
        timestamp: new Date(),
        agentId: "scheduler-agent",
        actions: [
          { id: "a-dir-ok", label: "就这样", variant: "primary" },
          { id: "a-dir-change", label: "再调调", variant: "secondary" },
        ],
      },
    ]
  }

  switch (step) {
    case 0:
      return [
        {
          id: `r-${Date.now()}-0`,
          role: "barrage",
          content: `收到。默认每天 ${timeStr} 执行。\n\n**你关注哪类房产？**`,
          timestamp: new Date(),
          agentId: "ai-assistant",
          actions: [
            { id: "a-sfh", label: "独栋住宅", variant: "primary" },
            { id: "a-condo", label: "公寓/联排", variant: "secondary" },
            { id: "a-all", label: "所有住宅类型", variant: "secondary" },
          ],
        },
      ]

    case 1:
      return [
        {
          id: `r-${Date.now()}-1`,
          role: "barrage",
          content: "好的，独栋住宅。\n\n**价格范围有偏好吗？**",
          timestamp: new Date(),
          agentId: "ai-assistant",
          actions: [
            { id: "a-price-all", label: "不限", variant: "secondary" },
            { id: "a-price-low", label: "$200k 以下", variant: "secondary" },
            { id: "a-price-mid", label: "$200k - $400k", variant: "primary" },
            { id: "a-price-high", label: "$400k 以上", variant: "secondary" },
          ],
        },
      ]

    case 2:
      return [
        {
          id: `r-${Date.now()}-2`,
          role: "barrage",
          content:
            "好的，独栋住宅，$200k-$400k。接下来关于你的 LinkedIn 发帖风格——\n\n**请粘贴你写过的帖子文字或链接**，我来分析你的风格。",
          timestamp: new Date(),
          agentId: "style-agent",
          inputPlaceholder: "粘贴 LinkedIn 帖子链接或文字…",
        },
      ]

    case 3:
      return [
        {
          id: `r-${Date.now()}-3`,
          role: "barrage",
          content:
            '我分析了你的帖子。你的风格是：**开头用一个反问句或数据引入，中间给出本地市场分析，结尾附行动号召，语气是专业但亲和的——像朋友间聊天但你是那个懂行的朋友。**\n\n以下是我将为你做的事：\n\n**每天早上 9 点自动执行：**\n1. 抓取富兰克林县当日新上市的独栋住宅（$200k-$400k）\n2. 汇总哥伦布市整体市场数据（中位价、库存、趋势）\n3. 用你的风格生成一篇 LinkedIn 帖子草稿\n4. 为每套新房源生成一封个性化推广邮件草稿\n5. 将以上内容推送到你的日历作为 9:00 AM 日程事件，**等你确认后再发布**',
          timestamp: new Date(),
          agentId: "ai-assistant",
          actions: [
            { id: "a-build", label: "开始构建", variant: "primary" },
            { id: "a-adjust", label: "我想调整", variant: "secondary" },
          ],
        },
      ]

    case 4:
      return [
        {
          id: `r-${Date.now()}-4a`,
          role: "barrage",
          content: "开始构建 LinkedIn Listing Posts Agent",
          timestamp: new Date(),
          icon: "build",
          agentId: "builder-agent",
          buildPhases: DEFAULT_BUILD_PHASES.map((p) => ({ ...p, status: "pending" as const })),
        },
      ]

    case 5:
      return [
        {
          id: `r-${Date.now()}-5`,
          role: "barrage",
          content:
            '**首次运行已完成**\n\n今日富兰克林县：3 套新增独栋住宅\n• 1847 Summit St — $265,000 · 3bed/2bath\n• 923 E Broad St — $310,000 · 4bed/2.5bath\n• 4501 Refugee Rd — $189,000 · 2bed/1bath\n\nLinkedIn 帖子草稿已生成，3 封推广邮件已准备好。',
          timestamp: new Date(),
          agentId: "builder-agent",
          icon: "task",
          actions: [
            { id: "a-daily", label: "设为每日任务", variant: "primary" },
            { id: "a-once", label: "仅这一次", variant: "secondary" },
          ],
        },
      ]

    case 6:
      return [
        {
          id: `r-${Date.now()}-6`,
          role: "barrage",
          content:
            '已设为每日任务！从明天起每天自动执行。\n\n你可以随时跟我说：\n• **"帖子风格不太像我"** → 调整写作风格\n• **"价格范围改一下"** → 更新筛选条件\n• **"改成每周一发"** → 调整发布节奏',
          timestamp: new Date(),
          agentId: "ai-assistant",
        },
      ]

    default:
      return [
        {
          id: `r-${Date.now()}-done`,
          role: "barrage",
          content: "好的，本次任务已完成。随时可以告诉我新的需求。",
          timestamp: new Date(),
          agentId: "ai-assistant",
        },
      ]
  }
}

function saveCurrentSession(get: () => ChatState, set: (fn: (s: ChatState) => Partial<ChatState>) => void) {
  const { activeSessionId, messages, step, branch, isTyping, focusedBuildEventId, expandedStepIndex } = get()
  if (!activeSessionId) return
  const firstUserMsg = messages.find((m) => m.role === "user")
  const title = firstUserMsg ? firstUserMsg.content.slice(0, 20) : undefined
  set((s) => ({
    sessions: {
      ...s.sessions,
      [activeSessionId]: {
        ...s.sessions[activeSessionId]!,
        messages,
        step: step as number,
        branch,
        isTyping,
        focusedBuildEventId,
        expandedStepIndex,
        title,
      },
    },
  }))
}

function humanDelay(base: number): number {
  const jitter = base * 0.4
  return base + Math.floor(Math.random() * jitter - jitter * 0.3)
}

function progressBuildForEvent(
  eventId: string,
  set: (fn: (s: ChatState) => Partial<ChatState>) => void,
  get: () => ChatState,
) {
  const build = get().activeBuilds[eventId]
  if (!build) return
  const phases = build.phases

  const pendingPhases: BuildPhase[] = []
  phases.forEach((p) => {
    if (p.status === "pending" || p.status === "auth-required") pendingPhases.push(p)
    if (p.children) {
      p.children.forEach((c) => { if (c.status === "pending") pendingPhases.push(c) })
    }
  })

  if (pendingPhases.length === 0) {
    const completedPhases = build.phases
    useCalendarStore.setState((cal) => ({
      events: cal.events.map((e) =>
        e.id === eventId ? { ...e, buildPhases: completedPhases } : e,
      ),
    }))

    const buildDoneMsg: ChatMessage = {
      id: `r-${Date.now()}-build-done-${eventId}`,
      role: "barrage" as const,
      content: "构建完毕，首次运行结果已生成",
      timestamp: new Date(),
      icon: "task" as const,
      agentId: eventId,
    }
    const ownerSessionId = eventId.startsWith("agent-") ? eventId.slice(6) : null
    const isOwnerActive = ownerSessionId === get().activeSessionId

    set((s) => {
      const { [eventId]: _, ...restBuilds } = s.activeBuilds
      const update: Partial<ChatState> = {
        activeBuilds: restBuilds,
        pendingAuth: null,
        buildPhases: Object.keys(restBuilds).length > 0
          ? Object.values(restBuilds)[0].phases
          : [],
        focusedBuildEventId: Object.keys(restBuilds).length > 0
          ? Object.keys(restBuilds)[0]
          : null,
      }
      if (isOwnerActive || !ownerSessionId) {
        update.messages = [...s.messages, buildDoneMsg]
      } else if (s.sessions[ownerSessionId]) {
        update.sessions = {
          ...s.sessions,
          [ownerSessionId]: {
            ...s.sessions[ownerSessionId],
            messages: [...s.sessions[ownerSessionId].messages, buildDoneMsg],
          },
        }
      }
      return update
    })

    useCalendarStore.getState().fillEventContent(eventId)
    return
  }

  let delay = 300

  for (const item of pendingPhases) {
    const d = delay

    setTimeout(() => {
      const currentBuild = get().activeBuilds[eventId]
      if (!currentBuild || currentBuild.paused) return

      if (item.authType && item.status !== "done") {
        const authData: PendingAuth = {
          phaseId: item.id,
          eventId,
          authType: item.authType!,
          label: item.authLabel ?? item.title,
          status: "waiting",
        }
        set((s) => {
          const newPhases = updatePhaseStatus(s.activeBuilds[eventId].phases, item.id, "auth-required")
          return {
            activeBuilds: {
              ...s.activeBuilds,
              [eventId]: { ...s.activeBuilds[eventId], phases: newPhases, pendingAuth: authData },
            },
            buildPhases: s.focusedBuildEventId === eventId ? newPhases : s.buildPhases,
            pendingAuth: authData,
          }
        })
        return
      }

      set((s) => {
        const newPhases = updatePhaseStatus(s.activeBuilds[eventId]?.phases ?? [], item.id, "running")
        return {
          activeBuilds: {
            ...s.activeBuilds,
            [eventId]: { ...s.activeBuilds[eventId], phases: newPhases },
          },
          buildPhases: s.focusedBuildEventId === eventId ? newPhases : s.buildPhases,
        }
      })

      setTimeout(() => {
        const cb = get().activeBuilds[eventId]
        if (!cb || cb.paused) return

        set((s) => {
          const newPhases = updatePhaseStatus(s.activeBuilds[eventId]?.phases ?? [], item.id, "done")
          return {
            activeBuilds: {
              ...s.activeBuilds,
              [eventId]: { ...s.activeBuilds[eventId], phases: newPhases },
            },
            buildPhases: s.focusedBuildEventId === eventId ? newPhases : s.buildPhases,
          }
        })

        const bp = get().activeBuilds[eventId]?.phases ?? []
        const remaining = bp.filter((p) => p.status === "pending" || p.status === "auth-required")
        const remainingChildren = bp.flatMap((p) => p.children ?? []).filter((c) => c.status === "pending")
        if (remaining.length === 0 && remainingChildren.length === 0) {
          progressBuildForEvent(eventId, set, get)
        }
      }, humanDelay(600))
    }, d)

    if (item.authType) break
    delay += humanDelay(800)
  }
}

function progressBuildPhases(
  set: (fn: (s: ChatState) => Partial<ChatState>) => void,
  get: () => ChatState,
) {
  const focused = get().focusedBuildEventId
  if (focused) {
    progressBuildForEvent(focused, set, get)
  }
}

function updatePhaseStatus(phases: BuildPhase[], id: string, status: BuildPhase["status"]): BuildPhase[] {
  return phases.map((p) => {
    if (p.id === id) return { ...p, status }
    if (p.children) {
      return { ...p, children: p.children.map((c) => (c.id === id ? { ...c, status } : c)) }
    }
    return p
  })
}

function scheduleReply(
  set: (fn: (s: ChatState) => Partial<ChatState>) => void,
  get: () => ChatState,
) {
  const originSessionId = get().activeSessionId
  set(() => ({ isTyping: true }))

  const { step, branch } = get()
  const replies = createReply(step, branch as ChatBranch).map((msg) => ({
    ...msg,
    stepIndex: step,
  }))

  let delay = humanDelay(400)

  replies.forEach((msg) => {
    const d = delay
    setTimeout(() => {
      if (get().activeSessionId !== originSessionId) {
        if (originSessionId && get().sessions[originSessionId]) {
          set((s) => ({
            sessions: {
              ...s.sessions,
              [originSessionId]: {
                ...s.sessions[originSessionId],
                messages: [...s.sessions[originSessionId].messages, msg],
              },
            },
          }))
        }
        return
      }
      set((s) => ({ messages: [...s.messages, msg] }))
      saveCurrentSession(get, set)
    }, d)
    delay += humanDelay(msg.subProcesses || msg.buildPhases ? 1400 : 700)
  })

  if (step === 0) {
    setTimeout(() => {
      useCalendarStore.getState().createPlaceholderEvents()
    }, 200)
  }

  if (step === 6) {
    const content = get().messages[get().messages.length - 1]?.content ?? ""
    if (content.includes("每日") || content.includes("daily")) {
      setTimeout(() => {
        useCalendarStore.getState().createRecurringEvents()
      }, 300)
    }
  }

  if (step === 4) {
    setTimeout(() => {
      const sessionId = originSessionId
      const eventId = sessionId ? `agent-${sessionId}` : "ai-today"
      const initPhases = DEFAULT_BUILD_PHASES.map((p) => ({
        ...p,
        status: "pending" as const,
        children: p.children?.map((c) => ({ ...c, status: "pending" as const })),
      }))

      if (get().activeSessionId === originSessionId) {
        set((s) => ({
          buildPhases: initPhases,
          buildPaused: false,
          isTyping: false,
          step: s.step + 1,
          activeBuilds: {
            ...s.activeBuilds,
            [eventId]: { eventId, phases: initPhases, paused: false },
          },
          focusedBuildEventId: eventId,
        }))
        saveCurrentSession(get, set)
      } else {
        set((s) => ({
          activeBuilds: {
            ...s.activeBuilds,
            [eventId]: { eventId, phases: initPhases, paused: false },
          },
          sessions: originSessionId && s.sessions[originSessionId] ? {
            ...s.sessions,
            [originSessionId]: {
              ...s.sessions[originSessionId],
              isTyping: false,
              step: (s.sessions[originSessionId].step ?? 0) + 1,
              focusedBuildEventId: eventId,
            },
          } : s.sessions,
        }))
      }

      progressBuildForEvent(eventId, set, get)
    }, delay + 200)
    return
  }

  setTimeout(() => {
    if (get().activeSessionId !== originSessionId) {
      if (originSessionId && get().sessions[originSessionId]) {
        set((s) => ({
          sessions: {
            ...s.sessions,
            [originSessionId]: {
              ...s.sessions[originSessionId],
              isTyping: false,
              step: branch !== "main" ? s.sessions[originSessionId].step : s.sessions[originSessionId].step + 1,
              branch: "main",
            },
          },
        }))
      }
      return
    }
    const s = get()
    if (s.branch !== "main") {
      set(() => ({ isTyping: false, branch: "main" }))
    } else {
      set((s) => ({ isTyping: false, step: s.step + 1 }))
    }
    saveCurrentSession(get, set)
  }, delay)
}

let sessionCounter = 0

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: {},
  activeSessionId: null,

  messages: [],
  inputValue: "",
  isTyping: false,
  step: 0,
  branch: "main",
  expandedStepIndex: null,
  activeBuilds: {},
  pendingAuths: [],
  focusedBuildEventId: null,
  buildPhases: [],
  buildPaused: false,
  pendingAuth: null,

  setInputValue: (v) => set({ inputValue: v }),
  setExpandedStep: (idx) => set({ expandedStepIndex: idx }),

  authorizeBuildPhase: (phaseId: string) => {
    const auth = get().pendingAuth
    const eventId = auth?.eventId ?? get().focusedBuildEventId ?? "ai-today"
    set((s) => {
      const build = s.activeBuilds[eventId]
      const newPhases = build ? updatePhaseStatus(build.phases, phaseId, "running") : updatePhaseStatus(s.buildPhases, phaseId, "running")
      const updatedAuth = s.pendingAuth ? { ...s.pendingAuth, status: "authorizing" as const } : null
      return {
        pendingAuth: updatedAuth,
        buildPhases: s.focusedBuildEventId === eventId ? newPhases : s.buildPhases,
        activeBuilds: build ? { ...s.activeBuilds, [eventId]: { ...build, phases: newPhases, pendingAuth: updatedAuth } } : s.activeBuilds,
      }
    })
    setTimeout(() => {
      const ownerSessionId = eventId.startsWith("agent-") ? eventId.slice(6) : null
      const isOwnerActive = ownerSessionId === get().activeSessionId
      const authOkMsg: ChatMessage = {
        id: `r-${Date.now()}-auth-ok`,
        role: "barrage" as const,
        content: "授权成功",
        timestamp: new Date(),
        icon: "auth" as const,
        agentId: eventId,
      }
      set((s) => {
        const build = s.activeBuilds[eventId]
        const newPhases = build ? updatePhaseStatus(build.phases, phaseId, "done") : updatePhaseStatus(s.buildPhases, phaseId, "done")
        const update: Partial<ChatState> = {
          pendingAuth: null,
          buildPhases: s.focusedBuildEventId === eventId ? newPhases : s.buildPhases,
          activeBuilds: build ? { ...s.activeBuilds, [eventId]: { ...build, phases: newPhases, pendingAuth: null } } : s.activeBuilds,
        }
        if (isOwnerActive || !ownerSessionId) {
          update.messages = [...s.messages, authOkMsg]
        } else if (ownerSessionId && s.sessions[ownerSessionId]) {
          update.sessions = {
            ...s.sessions,
            [ownerSessionId]: {
              ...s.sessions[ownerSessionId],
              messages: [...s.sessions[ownerSessionId].messages, authOkMsg],
            },
          }
        }
        return update
      })
      progressBuildForEvent(eventId, set, get)
    }, humanDelay(800))
  },

  cancelAuth: (phaseId: string) => {
    const auth = get().pendingAuth
    const eventId = auth?.eventId ?? get().focusedBuildEventId ?? "ai-today"
    const ownerSessionId = eventId.startsWith("agent-") ? eventId.slice(6) : null
    const isOwnerActive = ownerSessionId === get().activeSessionId
    const cancelMsg: ChatMessage = {
      id: `r-${Date.now()}-auth-cancel`,
      role: "barrage" as const,
      content: "授权已取消。你可以稍后重试，或者先告诉我其他需要调整的地方。",
      timestamp: new Date(),
      agentId: eventId,
    }
    set((s) => {
      const build = s.activeBuilds[eventId]
      const newPhases = build ? updatePhaseStatus(build.phases, phaseId, "error") : updatePhaseStatus(s.buildPhases, phaseId, "error")
      const failedAuth = s.pendingAuth ? { ...s.pendingAuth, status: "failed" as const } : null
      const update: Partial<ChatState> = {
        pendingAuth: failedAuth,
        buildPhases: s.focusedBuildEventId === eventId ? newPhases : s.buildPhases,
        activeBuilds: build ? { ...s.activeBuilds, [eventId]: { ...build, phases: newPhases, pendingAuth: failedAuth } } : s.activeBuilds,
      }
      if (isOwnerActive || !ownerSessionId) {
        update.messages = [...s.messages, cancelMsg]
      } else if (ownerSessionId && s.sessions[ownerSessionId]) {
        update.sessions = {
          ...s.sessions,
          [ownerSessionId]: {
            ...s.sessions[ownerSessionId],
            messages: [...s.sessions[ownerSessionId].messages, cancelMsg],
          },
        }
      }
      return update
    })
  },

  retryAuth: (phaseId: string) => {
    const auth = get().pendingAuth
    const eventId = auth?.eventId ?? get().focusedBuildEventId ?? "ai-today"
    set((s) => {
      const build = s.activeBuilds[eventId]
      const newPhases = build ? updatePhaseStatus(build.phases, phaseId, "auth-required") : updatePhaseStatus(s.buildPhases, phaseId, "auth-required")
      const retryingAuth = s.pendingAuth ? { ...s.pendingAuth, status: "waiting" as const } : null
      return {
        buildPhases: s.focusedBuildEventId === eventId ? newPhases : s.buildPhases,
        activeBuilds: build ? { ...s.activeBuilds, [eventId]: { ...build, phases: newPhases, pendingAuth: retryingAuth } } : s.activeBuilds,
        pendingAuth: retryingAuth,
      }
    })
  },

  toggleBuildPause: () => {
    const eventId = get().focusedBuildEventId
    if (!eventId) return
    const build = get().activeBuilds[eventId]
    if (!build) return
    const wasPaused = build.paused
    set((s) => ({
      buildPaused: !wasPaused,
      activeBuilds: {
        ...s.activeBuilds,
        [eventId]: { ...build, paused: !wasPaused },
      },
    }))
    if (wasPaused) {
      progressBuildForEvent(eventId, set, get)
    }
  },

  stopCurrentWork: () => {
    set((s) => ({
      isTyping: false,
      buildPaused: true,
      pendingAuth: null,
      pendingAuths: [],
      messages: [
        ...s.messages,
        {
          id: `r-${Date.now()}-stopped`,
          role: "barrage" as const,
          content: "已停止当前操作。你可以继续发消息告诉我下一步该怎么做。",
          timestamp: new Date(),
          agentId: "ai-assistant",
        },
      ],
    }))
  },

  focusBuild: (eventId) => {
    const build = eventId ? get().activeBuilds[eventId] : null
    set({
      focusedBuildEventId: eventId,
      buildPhases: build?.phases ?? [],
      buildPaused: build?.paused ?? false,
    })
  },

  createSession: () => {
    saveCurrentSession(get, set)
    const existingEmpty = Object.values(get().sessions).find(
      (s) => s.messages.length === 0 && s.id !== get().activeSessionId,
    )
    if (existingEmpty) {
      get().switchSession(existingEmpty.id)
      return existingEmpty.id
    }
    if (get().activeSessionId && get().messages.length === 0) {
      return get().activeSessionId!
    }
    const id = `session-${Date.now()}-${++sessionCounter}`
    const session: ChatSession = {
      id,
      messages: [],
      step: 0,
      branch: "main",
      isTyping: false,
      linkedEventIds: [],
      createdAt: new Date(),
      focusedBuildEventId: null,
      expandedStepIndex: null,
    }
    set((s) => ({
      sessions: { ...s.sessions, [id]: session },
      activeSessionId: id,
      messages: [],
      step: 0,
      branch: "main",
      isTyping: false,
      inputValue: "",
      expandedStepIndex: null,
      focusedBuildEventId: null,
      buildPhases: [],
      buildPaused: false,
    }))
    return id
  },

  switchSession: (id) => {
    saveCurrentSession(get, set)
    const session = get().sessions[id]
    if (!session) return
    const focusedId = session.focusedBuildEventId ?? null
    const build = focusedId ? get().activeBuilds[focusedId] : null
    set({
      activeSessionId: id,
      messages: session.messages,
      step: session.step,
      branch: session.branch as ChatBranch,
      isTyping: session.isTyping,
      expandedStepIndex: session.expandedStepIndex ?? null,
      focusedBuildEventId: focusedId,
      buildPhases: build?.phases ?? [],
      buildPaused: build?.paused ?? false,
      pendingAuth: build?.pendingAuth ?? null,
    })
  },

  resetChat: () => {
    saveCurrentSession(get, set)
    const id = `session-${Date.now()}-${++sessionCounter}`
    const session: ChatSession = {
      id,
      messages: [],
      step: 0,
      branch: "main",
      isTyping: false,
      linkedEventIds: [],
      createdAt: new Date(),
      focusedBuildEventId: null,
      expandedStepIndex: null,
    }
    set((s) => ({
      sessions: { ...s.sessions, [id]: session },
      activeSessionId: id,
      messages: [],
      inputValue: "",
      isTyping: false,
      step: 0,
      branch: "main",
      expandedStepIndex: null,
      focusedBuildEventId: null,
      buildPhases: [],
      buildPaused: false,
    }))
  },

  sendMessage: (content: string) => {
    if (!get().activeSessionId) {
      get().createSession()
    }

    const currentStep = get().step
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
      stepIndex: currentStep,
    }
    set((s) => ({
      messages: [...s.messages, userMsg],
      inputValue: "",
    }))

    const detectedBranch = detectBranch(content, get().step)
    if (detectedBranch) {
      set({ branch: detectedBranch })
    }

    saveCurrentSession(get, set)
    scheduleReply(set, get)
  },
}))
