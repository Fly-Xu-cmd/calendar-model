import { create } from "zustand"
import type { ChatMessage, ChatSession, StepMeta } from "@/types"
import { useCalendarStore } from "./calendarStore"

type ChatBranch = "main" | "adjust-style" | "adjust-range" | "adjust-direction"

export const STEP_METAS: StepMeta[] = [
  { icon: "⏰", title: "执行时间" },
  { icon: "🏠", title: "房产类型" },
  { icon: "💰", title: "价格范围" },
  { icon: "📝", title: "风格参考" },
  { icon: "📋", title: "计划确认" },
  { icon: "🔨", title: "构建 Agent" },
  { icon: "✅", title: "配置完成" },
]

interface ChatState {
  sessions: Record<string, ChatSession>
  activeSessionId: string | null

  messages: ChatMessage[]
  inputValue: string
  isTyping: boolean
  step: number
  branch: ChatBranch
  expandedStepIndex: number | null

  setInputValue: (v: string) => void
  sendMessage: (content: string) => void
  resetChat: () => void
  createSession: () => string
  switchSession: (id: string) => void
  setExpandedStep: (idx: number | null) => void
}

function detectBranch(content: string, currentStep: number): ChatBranch | null {
  if (currentStep < 5) return null
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
  if (branch === "adjust-style") {
    return [
      {
        id: `r-${Date.now()}-style`,
        role: "assistant",
        content:
          '收到，我重新分析了你最喜欢的第 3 篇和第 5 篇帖子。调整后的风格更口语化，多用 emoji 和第二人称。\n\n新版本：\n\n"你们有没有注意到最近 Clintonville 的房子上得越来越快了？🏠 今天富兰克林县又多了两套——Summit St 那套 $265k 真的值得去看看。想知道现在上车是不是好时机？来聊👇"',
        timestamp: new Date(),
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
        role: "assistant",
        content:
          "好的，已更新筛选条件：\n\n• 价格范围：**$150k - $400k**\n• 包含最近 **3 天内**上市且仍在售的房源\n\n按新条件重新运行，今日结果：**7 套房源**（比之前的 3 套多了 4 套）",
        timestamp: new Date(),
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
        role: "assistant",
        content:
          "明白，已调整节奏：\n\n**每天 9:00 AM**\n• 邮件汇总 + 日历事件（不发 LinkedIn）\n\n**每周一 9:00 AM**\n• 市场周报 + LinkedIn 帖子草稿\n\n其他设置保持不变（独栋住宅，$200k-$400k，Franklin County）。",
        timestamp: new Date(),
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
          role: "assistant",
          content:
            "收到。关于富兰克林县的新房源监控，我先确认一下——\n\n**你希望什么时间执行？**",
          timestamp: new Date(),
          actions: [
            { id: "a-time-daily9", label: "每天早上 9:00", variant: "primary" },
            { id: "a-time-daily8", label: "每天早上 8:00", variant: "secondary" },
            { id: "a-time-weekly", label: "每周一早上 9:00", variant: "secondary" },
          ],
        },
      ]

    case 1:
      return [
        {
          id: `r-${Date.now()}-1`,
          role: "assistant",
          content:
            "好的，已安排执行时间。接下来——\n\n**你关注哪类房产？**",
          timestamp: new Date(),
          actions: [
            { id: "a-sfh", label: "独栋住宅", variant: "primary" },
            { id: "a-condo", label: "公寓/联排", variant: "secondary" },
            { id: "a-all", label: "所有住宅类型", variant: "secondary" },
          ],
        },
      ]

    case 2:
      return [
        {
          id: `r-${Date.now()}-2a`,
          role: "assistant",
          content: "好的，独栋住宅。\n\n**价格范围有偏好吗？**",
          timestamp: new Date(),
          actions: [
            { id: "a-price-all", label: "不限", variant: "secondary" },
            { id: "a-price-low", label: "$200k 以下", variant: "secondary" },
            { id: "a-price-mid", label: "$200k - $400k", variant: "primary" },
            { id: "a-price-high", label: "$400k 以上", variant: "secondary" },
          ],
        },
      ]

    case 3:
      return [
        {
          id: `r-${Date.now()}-3`,
          role: "assistant",
          content:
            "好的，独栋住宅，$200k-$400k。接下来关于你的 LinkedIn 发帖风格——\n\n**请粘贴你写过的帖子文字或链接**，我来分析你的风格。",
          timestamp: new Date(),
          inputPlaceholder: "粘贴 LinkedIn 帖子链接或文字…",
        },
      ]

    case 4:
      return [
        {
          id: `r-${Date.now()}-4`,
          role: "assistant",
          content:
            '我分析了你的帖子。你的风格是：**开头用一个反问句或数据引入，中间给出本地市场分析，结尾附行动号召，语气是专业但亲和的——像朋友间聊天但你是那个懂行的朋友。**\n\n以下是我将为你做的事：\n\n**每天早上 9 点自动执行：**\n1. 抓取富兰克林县当日新上市的独栋住宅（$200k-$400k）\n2. 汇总哥伦布市整体市场数据（中位价、库存、趋势）\n3. 用你的风格生成一篇 LinkedIn 帖子草稿\n4. 为每套新房源生成一封个性化推广邮件草稿\n5. 将以上内容推送到你的日历作为 9:00 AM 日程事件，**等你确认后再发布**',
          timestamp: new Date(),
          actions: [
            { id: "a-build", label: "开始构建", variant: "primary" },
            { id: "a-adjust", label: "我想调整", variant: "secondary" },
          ],
        },
      ]

    case 5:
      return [
        {
          id: `r-${Date.now()}-5a`,
          role: "assistant",
          content: "开始构建 LinkedIn Listing Posts Agent",
          timestamp: new Date(),
          icon: "build",
        },
        {
          id: `r-${Date.now()}-4b`,
          role: "assistant",
          content: "Building LinkedIn Listing Posts Agent",
          timestamp: new Date(),
          icon: "task",
          subProcesses: [
            {
              id: "sp1",
              title: "连接哥伦布房产数据源",
              status: "done",
              detail: "已连接 Franklin County MLS 数据接口，数据延迟 < 15 分钟。",
            },
            {
              id: "sp2",
              title: "分析你的 5 篇 LinkedIn 帖子风格",
              status: "done",
              detail:
                "风格摘要：开头反问句/数据引入，中间本地市场分析，结尾行动号召。语气专业且亲和，常用 emoji，第二人称拉近距离。",
            },
            {
              id: "sp3",
              title: "创建富兰克林县新房源监控",
              status: "done",
              detail: "监控条件：独栋住宅，$200k-$400k，Franklin County，每日 8:30 AM 运行。",
              children: [
                {
                  id: "sp3-1",
                  title: "配置数据筛选规则",
                  status: "done",
                  detail: "房产类型：Single Family\n价格区间：$200,000 - $400,000\n区域：Franklin County, OH",
                },
                { id: "sp3-2", title: "设置新房源变更检测", status: "done" },
              ],
            },
            { id: "sp4", title: "LinkedIn 授权", status: "done", detail: "OAuth 授权成功，已获得发帖权限。" },
            { id: "sp5", title: "日历授权", status: "done", detail: "Notion Calendar 授权成功，已获得日程创建权限。" },
            {
              id: "sp6",
              title: "进行第一次试运行",
              status: "done",
              children: [
                { id: "sp6-1", title: "抓取今日富兰克林县新增房源", status: "done", detail: "今日新增 3 套独栋住宅（$200k-$400k 区间）。" },
                { id: "sp6-2", title: "生成 LinkedIn 帖子草稿", status: "done", detail: "已用你的风格生成帖子草稿，包含今日市场数据和新房源亮点。" },
                { id: "sp6-3", title: "生成 3 封个性化推广邮件", status: "done" },
                { id: "sp6-4", title: "写入日历日程事件", status: "done" },
              ],
            },
          ],
        },
        {
          id: `r-${Date.now()}-4c`,
          role: "assistant",
          content:
            '**"哥伦布市场速报"构建完成，首次运行已交付**\n\n今日富兰克林县：3 套新增独栋住宅\n• 1847 Summit St — $265,000 · 3bed/2bath\n• 923 E Broad St — $310,000 · 4bed/2.5bath\n• 4501 Refugee Rd — $189,000 · 2bed/1bath\n\nLinkedIn 帖子草稿已生成\n3 封推广邮件草稿已生成\n已在你的日历上创建 9:00 AM 日程事件',
          timestamp: new Date(),
          actions: [
            { id: "a-auto", label: "满意，设为每日自动", variant: "primary" },
            { id: "a-tweak", label: "我想调整", variant: "secondary" },
          ],
        },
      ]

    default:
      return [
        {
          id: `r-${Date.now()}-done`,
          role: "assistant",
          content:
            '已设为每日自动！\n\n从明天起，每天早上 9:00 我会自动执行以上流程，结果以日程事件形态推送到你的日历。\n\n第一周我会等你确认后再发布。等你觉得质量稳定了，随时可以在日历事件里点「以后不用确认，直接发」切换为全自动模式。\n\n你也可以随时跟我说：\n• **"帖子风格不太像我"** → 我会调整写作风格\n• **"价格范围改一下"** → 我会更新筛选条件\n• **"LinkedIn 改成每周一发"** → 我会调整发布节奏',
          timestamp: new Date(),
        },
      ]
  }
}

function saveCurrentSession(get: () => ChatState, set: (fn: (s: ChatState) => Partial<ChatState>) => void) {
  const { activeSessionId, messages, step, branch, isTyping } = get()
  if (!activeSessionId) return
  set((s) => ({
    sessions: {
      ...s.sessions,
      [activeSessionId]: {
        ...s.sessions[activeSessionId]!,
        messages,
        step: step as number,
        branch,
        isTyping,
      },
    },
  }))
}

function humanDelay(base: number): number {
  const jitter = base * 0.4
  return base + Math.floor(Math.random() * jitter - jitter * 0.3)
}

function scheduleReply(
  set: (fn: (s: ChatState) => Partial<ChatState>) => void,
  get: () => ChatState,
) {
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
      set((s) => ({ messages: [...s.messages, msg] }))
      saveCurrentSession(get, set)
    }, d)
    delay += humanDelay(msg.subProcesses ? 1400 : 700)
  })

  if (step === 1) {
    setTimeout(() => {
      useCalendarStore.getState().createPlaceholderEvents()
    }, 200)
  }

  if (step === 5) {
    setTimeout(() => {
      useCalendarStore.getState().fillEventContent()
    }, 200)
  }

  setTimeout(() => {
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

  setInputValue: (v) => set({ inputValue: v }),
  setExpandedStep: (idx) => set({ expandedStepIndex: idx }),

  createSession: () => {
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
    }
    set((s) => ({
      sessions: { ...s.sessions, [id]: session },
      activeSessionId: id,
      messages: [],
      step: 0,
      branch: "main",
      isTyping: false,
      inputValue: "",
    }))
    return id
  },

  switchSession: (id) => {
    saveCurrentSession(get, set)
    const session = get().sessions[id]
    if (!session) return
    set({
      activeSessionId: id,
      messages: session.messages,
      step: session.step,
      branch: session.branch as ChatBranch,
      isTyping: session.isTyping,
    })
  },

  resetChat: () => {
    const id = `session-${Date.now()}-${++sessionCounter}`
    const session: ChatSession = {
      id,
      messages: [],
      step: 0,
      branch: "main",
      isTyping: false,
      linkedEventIds: [],
      createdAt: new Date(),
    }
    set((s) => ({
      sessions: { ...s.sessions, [id]: session },
      activeSessionId: id,
      messages: [],
      inputValue: "",
      isTyping: false,
      step: 0,
      branch: "main",
    }))
  },

  sendMessage: (content: string) => {
    if (get().isTyping) return

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
