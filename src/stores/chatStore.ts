import { create } from "zustand"
import type { ChatMessage, SubProcess, ChatAction } from "@/types"

interface ChatState {
  messages: ChatMessage[]
  inputValue: string
  isTyping: boolean

  setInputValue: (v: string) => void
  sendMessage: (content: string) => void
}

interface MockStep {
  content: string
  subProcesses?: SubProcess[]
  actions?: ChatAction[]
}

const mockFlow: MockStep[] = [
  {
    content: "收到！我来帮你处理。先确认一下需求细节：\n\n**你关注哪类房产？**",
    actions: [
      { id: "a1", label: "独栋住宅", variant: "primary" },
      { id: "a2", label: "公寓 / 联排", variant: "secondary" },
      { id: "a3", label: "所有住宅类型", variant: "secondary" },
    ],
  },
  {
    content:
      "好的，已锁定独栋住宅。我正在抓取今日富兰克林县的数据并生成分析报告……",
    subProcesses: [
      { id: "sp1", title: "连接 MLS 数据源", status: "done", detail: "成功获取 Franklin County 今日挂牌数据，共 342 条活跃房源。" },
      { id: "sp2", title: "筛选新增独栋住宅", status: "done", detail: "今日新增 3 套独栋住宅：\n• 1847 Summit St — $265,000 (3bed/2bath)\n• 923 E Broad St — $310,000 (4bed/2.5bath)\n• 4501 Refugee Rd — $189,000 (2bed/1bath)" },
      { id: "sp3", title: "生成市场分析摘要", status: "done", detail: "中位价 $287,500（周环比 +1.2%），在售库存 342 套。市场热度较上周微升。" },
      { id: "sp4", title: "撰写 LinkedIn 帖子草稿", status: "done", detail: "已用你的历史发帖风格生成草稿，语气亲和、开头用数据引入。" },
    ],
  },
  {
    content:
      "分析完成！3 套新房源已整理好。\n\n我已生成 LinkedIn 帖子草稿和 3 封个性化推广邮件，并在你的日历 9:00 AM 创建了待确认事件。\n\n你可以去日历页面查看详情。",
    actions: [
      { id: "a4", label: "查看日历", variant: "primary" },
      { id: "a5", label: "编辑帖子草稿", variant: "secondary" },
    ],
  },
]

let step = 0

function scheduleReply(
  set: (fn: (s: ChatState) => Partial<ChatState>) => void,
) {
  set(() => ({ isTyping: true }))

  const currentStep = mockFlow[Math.min(step, mockFlow.length - 1)]
  step++

  if (currentStep.subProcesses) {
    const subs = currentStep.subProcesses
    let idx = 0

    const partialMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: currentStep.content,
      timestamp: new Date(),
      subProcesses: [],
      actions: currentStep.actions,
    }

    set((s) => ({
      messages: [...s.messages, partialMsg],
    }))

    const interval = setInterval(() => {
      if (idx >= subs.length) {
        clearInterval(interval)
        set(() => ({ isTyping: false }))
        return
      }

      const sub = subs[idx]
      idx++

      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === partialMsg.id
            ? { ...m, subProcesses: [...(m.subProcesses ?? []), sub] }
            : m
        ),
      }))
    }, 500 + Math.random() * 300)
  } else {
    setTimeout(() => {
      const msg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: currentStep.content,
        timestamp: new Date(),
        actions: currentStep.actions,
      }
      set((s) => ({
        messages: [...s.messages, msg],
        isTyping: false,
      }))
    }, 600 + Math.random() * 400)
  }
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
