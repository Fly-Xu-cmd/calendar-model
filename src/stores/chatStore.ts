import { create } from "zustand"
import type { ChatMessage } from "@/types"

interface ChatState {
  messages: ChatMessage[]
  inputValue: string
  isTyping: boolean

  setInputValue: (v: string) => void
  sendMessage: (content: string) => void
}

const mockFlow: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content:
      "LinkedIn Listing Posts Agent 开始构建了 🚀 它会：",
    timestamp: new Date(),
    icon: "build",
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "1. 抓取并分析你的 LinkedIn 帖子风格\n2. 从房源监控数据库中读取最新房源\n3. 模仿你的风格生成帖子\n4. 先发邮件给你审核，确认后发布到 LinkedIn",
    timestamp: new Date(),
  },
  {
    id: "m3",
    role: "assistant",
    content: "构建完成后我会通知你，并帮两个 Agent 都设好每天早上9点的定时任务 ⏰",
    timestamp: new Date(),
  },
  {
    id: "m4",
    role: "assistant",
    content: "Building LinkedIn Listing Posts",
    timestamp: new Date(),
    icon: "task",
    subProcesses: [
      {
        id: "sp1",
        title: "Reviewing workflow guidance",
        status: "done",
        detail: "已读取工作流配置文件，确认发帖流程为：抓取 → 生成 → 审核 → 发布。",
      },
      {
        id: "sp2",
        title: "Inspecting listing database",
        status: "done",
        children: [
          {
            id: "sp2-1",
            title: "Database schema (4 tables)",
            status: "done",
            detail: "listings, agents, markets, posts 四张表结构已确认。",
          },
          {
            id: "sp2-2",
            title: "Connecting LinkedIn for approved post publishing",
            status: "running",
          },
        ],
      },
      {
        id: "sp3",
        title: "Scraping LinkedIn voice samples",
        status: "running",
        children: [
          {
            id: "sp3-1",
            title: "Scraping the example LinkedIn post for writing style",
            status: "running",
          },
          {
            id: "sp3-2",
            title: "Scraping the LinkedIn profile for voice and brand context",
            status: "running",
          },
        ],
      },
    ],
  },
]

let step = 0

function scheduleReply(
  set: (fn: (s: ChatState) => Partial<ChatState>) => void,
) {
  set(() => ({ isTyping: true }))

  const batchEnd = Math.min(step + 3, mockFlow.length)
  let delay = 0

  for (let i = step; i < batchEnd; i++) {
    const msg = mockFlow[i]
    const d = delay
    setTimeout(() => {
      set((s) => ({
        messages: [...s.messages, { ...msg, id: `msg-${Date.now()}-${i}`, timestamp: new Date() }],
      }))
    }, d)
    delay += msg.subProcesses ? 800 : 400
  }

  setTimeout(() => {
    set(() => ({ isTyping: false }))
  }, delay)

  step = batchEnd
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  inputValue: "",
  isTyping: false,

  setInputValue: (v) => set({ inputValue: v }),

  sendMessage: (content: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    }
    set((s) => ({
      messages: [...s.messages, userMsg],
      inputValue: "",
    }))
    scheduleReply(set)
  },
}))
