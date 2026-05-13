import { useState } from "react"
import {
  X,
  Check,
  SkipForward,
  Unlock,
  Lock,
  ChevronDown,
  ChevronRight,
  Pencil,
  Send,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCalendarStore } from "@/stores/calendarStore"
import type { CalendarEvent, EmailDraft } from "@/types"

function StatusBadge({ status }: { status: CalendarEvent["status"] }) {
  if (status === "confirmed")
    return <span className="text-[11px] text-green-600 font-medium">✅ 已发布</span>
  if (status === "auto-published")
    return <span className="text-[11px] text-blue-600 font-medium">✅ 已自动发布</span>
  if (status === "skipped")
    return <span className="text-[11px] text-stone-400 font-medium">⏭️ 已跳过</span>
  return <span className="text-[11px] text-amber-600 font-medium">🟡 待你确认</span>
}

function EmailRow({ draft, eventId }: { draft: EmailDraft; eventId: string }) {
  const toggle = useCalendarStore((s) => s.toggleEmailSelected)
  return (
    <button
      onClick={() => toggle(eventId, draft.id)}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors text-xs",
        draft.selected ? "bg-amber-50/60" : "opacity-50",
      )}
    >
      <div className={cn(
        "flex size-3.5 shrink-0 items-center justify-center rounded border",
        draft.selected ? "border-amber-500 bg-amber-500 text-white" : "border-stone-300",
      )}>
        {draft.selected && <Check className="size-2" />}
      </div>
      <span className="text-stone-600 truncate">{draft.to}</span>
      <span className="text-stone-400 truncate flex-1">— {draft.subject}</span>
    </button>
  )
}

export function EventDetailPanel() {
  const selectedEventId = useCalendarStore((s) => s.selectedEventId)
  const events = useCalendarStore((s) => s.events)
  const selectEvent = useCalendarStore((s) => s.selectEvent)
  const confirmEvent = useCalendarStore((s) => s.confirmEvent)
  const skipEvent = useCalendarStore((s) => s.skipEvent)
  const trustMode = useCalendarStore((s) => s.trustMode)
  const setTrustMode = useCalendarStore((s) => s.setTrustMode)
  const editingLinkedin = useCalendarStore((s) => s.editingLinkedin)
  const setEditingLinkedin = useCalendarStore((s) => s.setEditingLinkedin)
  const editedDraft = useCalendarStore((s) => s.editedLinkedinDraft)
  const setEditedDraft = useCalendarStore((s) => s.setEditedLinkedinDraft)
  const confirmWithEdit = useCalendarStore((s) => s.confirmWithEdit)

  const [emailsOpen, setEmailsOpen] = useState(false)

  const event = events.find((e) => e.id === selectedEventId)
  if (!event) return null

  const ai = event.aiContent
  const isDraft = event.status === "draft"
  const isActioned = event.status === "confirmed" || event.status === "auto-published" || event.status === "skipped"
  const priceUp = ai?.priceChange?.includes("↑")

  return (
    <div className="flex h-full w-[400px] shrink-0 flex-col border-l border-stone-200 bg-[#faf8f5]">
      {/* header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <StatusBadge status={event.status} />
          <span className="text-[11px] text-stone-400">·</span>
          <span className="text-[11px] text-stone-400">{event.startTime} AM</span>
        </div>
        <button
          onClick={() => selectEvent(null)}
          className="rounded-lg p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {ai ? (
          <>
            {/* market stats — one compact row */}
            <div>
              <p className="text-xs text-stone-400 mb-2">📊 市场概览</p>
              <p className="text-[13px] text-stone-700 leading-relaxed">
                中位价 <strong>{ai.medianPrice}</strong>
                <span className={cn("ml-1", priceUp ? "text-green-600" : "text-red-500")}>
                  （周环比{ai.priceChange}）
                </span>
                ，在售库存 <strong>{ai.inventory}</strong> 套
                {ai.newListings > 0 && <>，新增 <strong>{ai.newListings}</strong> 套</>}
              </p>
            </div>

            {/* listings — simple list */}
            {ai.listings.length > 0 && (
              <div>
                <p className="text-xs text-stone-400 mb-2">🏠 {ai.newListings} 套新房源</p>
                <div className="space-y-1">
                  {ai.listings.map((l) => (
                    <div key={l.address} className="flex items-baseline justify-between text-[13px] py-1">
                      <span className="text-stone-700">{l.address}</span>
                      <span className="text-stone-500 text-xs ml-2 shrink-0">
                        {l.price} · {l.beds}bd/{l.baths}ba
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* linkedin draft */}
            <div>
              <p className="text-xs text-stone-400 mb-2">✉️ LinkedIn 帖子草稿</p>
              {editingLinkedin && isDraft ? (
                <textarea
                  value={editedDraft}
                  onChange={(e) => setEditedDraft(e.target.value)}
                  className="w-full min-h-[100px] rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-[13px] text-stone-700 leading-relaxed focus:outline-none focus:border-amber-400 resize-none"
                  autoFocus
                />
              ) : (
                <p className="text-[13px] text-stone-600 leading-relaxed whitespace-pre-line">
                  {ai.linkedinDraft}
                </p>
              )}
            </div>

            {/* emails — collapsed by default */}
            {ai.emailDrafts.length > 0 && (
              <div>
                <button
                  onClick={() => setEmailsOpen(!emailsOpen)}
                  className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {emailsOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                  📧 {ai.emailDrafts.length} 封推广邮件草稿
                  {isDraft && <span className="text-stone-300">— 点击勾选</span>}
                </button>
                {emailsOpen && (
                  <div className="mt-2 space-y-0.5">
                    {ai.emailDrafts.map((d) => (
                      <EmailRow key={d.id} draft={d} eventId={event.id} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-stone-500">{event.description ?? "无更多详情"}</p>
        )}
      </div>

      {/* actions */}
      {ai && (
        <div className="shrink-0 border-t border-stone-100 px-5 py-3.5 space-y-2.5">
          {isDraft && !editingLinkedin && (
            <div className="flex gap-2">
              <Button
                onClick={() => confirmEvent(event.id)}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-9 text-[13px]"
              >
                <Check className="size-3.5 mr-1" /> 确认发布
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingLinkedin(true)}
                className="rounded-xl h-9 text-[13px] px-3"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => skipEvent(event.id)}
                className="rounded-xl h-9 text-[13px] px-3"
              >
                <SkipForward className="size-3.5" />
              </Button>
            </div>
          )}

          {isDraft && editingLinkedin && (
            <div className="flex gap-2">
              <Button
                onClick={() => confirmWithEdit(event.id, editedDraft)}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-9 text-[13px]"
              >
                <Send className="size-3.5 mr-1" /> 编辑后发布
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingLinkedin(false)}
                className="rounded-xl h-9 text-[13px]"
              >
                取消
              </Button>
            </div>
          )}

          {/* trust toggle */}
          <div className="flex items-center justify-between">
            {isDraft && trustMode === "confirm" && (
              <button
                onClick={() => setTrustMode("auto")}
                className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-600 transition-colors"
              >
                <Unlock className="size-3" /> 以后不用确认，直接发
              </button>
            )}
            {trustMode === "auto" && (
              <button
                onClick={() => setTrustMode("confirm")}
                className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-600 transition-colors"
              >
                <Lock className="size-3" /> 改回需要确认
              </button>
            )}
            {isActioned && trustMode === "confirm" && (
              <span className="text-[11px] text-stone-300">
                {event.status === "confirmed" && "已确认发布"}
                {event.status === "skipped" && "已跳过本日"}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
