import { create } from "zustand"
import type { AgentState, ChatMessage, ChatOption } from "@/types"

interface AgentStore {
  state: AgentState
  chatHistory: ChatMessage[]
  inputValue: string
  isTyping: boolean
  conversationStep: number

  setState: (state: AgentState) => void
  setInputValue: (value: string) => void
  addMessage: (message: ChatMessage) => void
  clearChat: () => void
  open: () => void
  close: () => void
  sendMessage: (content: string) => void
  selectOption: (option: ChatOption) => void
}

interface MockResponse {
  content: string
  options?: ChatOption[]
}

const conversationFlow: MockResponse[] = [
  {
    content:
      "收到。关于富兰克林县的新房源监控，我需要确认几个细节：\n\n**你关注哪类房产？**",
    options: [
      { id: "opt-1", label: "🏠 独栋住宅" },
      { id: "opt-2", label: "🏢 公寓/联排" },
      { id: "opt-3", label: "📋 所有住宅类型" },
    ],
  },
  {
    content:
      "好的。接下来关于你的 LinkedIn 发帖风格——\n\n**请把你写过的帖子发给我。** 你可以粘贴帖子文字或发送链接。",
    options: [
      { id: "opt-4", label: "📋 粘贴帖子文字" },
      { id: "opt-5", label: "🔗 发送链接" },
    ],
  },
  {
    content:
      '我分析了你的内容。你的风格是：**开头用反问句或数据引入，中间本地市场分析，结尾附行动号召。语气专业但亲和。**\n\n📅 每天早上 9 点自动执行：\n1. 抓取富兰克林县当日新上市的独栋住宅\n2. 汇总哥伦布市整体市场数据\n3. 用你的风格生成 LinkedIn 帖子草稿\n4. 推送到日历作为待确认事件',
    options: [
      { id: "opt-6", label: "🟦 开始构建" },
      { id: "opt-7", label: "⬜ 我想调整" },
    ],
  },
  {
    content:
      "✅ 配置完成！首次运行已交付。\n\n📊 今日富兰克林县：3 套新增独栋住宅\n📅 已在你的日历上创建 9:00 AM 事件\n\n你可以在日历上点击查看详情并确认发布。",
  },
]

function scheduleReply(set: (fn: (s: AgentStore) => Partial<AgentStore>) => void, get: () => AgentStore) {
  set(() => ({ isTyping: true }))

  setTimeout(() => {
    const step = get().conversationStep
    const response = conversationFlow[Math.min(step, conversationFlow.length - 1)]

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: response.content,
      options: response.options,
      timestamp: new Date(),
    }

    set((s) => ({
      chatHistory: [...s.chatHistory, assistantMsg],
      isTyping: false,
      conversationStep: s.conversationStep + 1,
    }))
  }, 600 + Math.random() * 400)
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  state: "idle",
  chatHistory: [],
  inputValue: "",
  isTyping: false,
  conversationStep: 0,

  setState: (state) => set({ state }),
  setInputValue: (value) => set({ inputValue: value }),
  addMessage: (message) =>
    set((s) => ({ chatHistory: [...s.chatHistory, message] })),
  clearChat: () => set({ chatHistory: [], conversationStep: 0 }),

  open: () => set({ state: "input" }),

  close: () =>
    set({ state: "idle", inputValue: "", isTyping: false }),

  sendMessage: (content: string) => {
    if (get().isTyping) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    }

    set((s) => ({
      chatHistory: [...s.chatHistory, userMsg],
      inputValue: "",
      state: "active",
    }))

    scheduleReply(set, get)
  },

  selectOption: (option: ChatOption) => {
    if (get().isTyping) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: option.label,
      timestamp: new Date(),
    }

    set((s) => ({
      chatHistory: [...s.chatHistory, userMsg],
      state: "active",
    }))

    scheduleReply(set, get)
  },
}))
