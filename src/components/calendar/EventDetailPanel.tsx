import { useState } from "react"
import {
  X,
  Check,
  SkipForward,
  Unlock,
  Lock,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCalendarStore } from "@/stores/calendarStore"
import type { CalendarEvent, EmailDraft } from "@/types"

function EmailRow({ draft, eventId }: { draft: EmailDraft; eventId: string }) {
  const toggle = useCalendarStore((s) => s.toggleEmailSelected)
  return (
    <button
      onClick={() => toggle(eventId, draft.id)}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors text-xs",
        draft.selected ? "bg-slate-50" : "opacity-40",
      )}
    >
      <div className={cn(
        "flex size-3.5 shrink-0 items-center justify-center rounded border",
        draft.selected ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300",
      )}>
        {draft.selected && <Check className="size-2" />}
      </div>
      <span className="text-slate-600 truncate">{draft.to}</span>
      <span className="text-slate-400 truncate flex-1">— {draft.subject}</span>
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
  const streamingEventId = useCalendarStore((s) => s.streamingEventId)

  const [emailsOpen, setEmailsOpen] = useState(false)

  const event = events.find((e) => e.id === selectedEventId)
  if (!event) return null

  const ai = event.aiContent
  const isDraft = event.status === "draft"
  const isActioned = event.status === "confirmed" || event.status === "auto-published" || event.status === "skipped"
  const isStreaming = streamingEventId === event.id

  return (
    <div className="flex h-full w-full sm:w-[320px] lg:w-[380px] shrink-0 flex-col border-l border-slate-200 bg-white">
      {/* header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          {isStreaming ? (
            <span className="flex items-center gap-1.5 text-[11px] text-blue-500 font-medium">
              <Loader2 className="size-3 animate-spin" /> 生成中
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 font-medium">
              {event.status === "confirmed" && "已发布"}
              {event.status === "auto-published" && "已自动发布"}
              {event.status === "skipped" && "已跳过"}
              {event.status === "draft" && "待确认"}
            </span>
          )}
          <span className="text-slate-300">·</span>
          <span className="text-[11px] text-slate-400">{event.startTime}</span>
        </div>
        <button
          onClick={() => selectEvent(null)}
          className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {ai ? (
          <>
            {(ai.marketOverview || isStreaming) && (
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">市场概览</p>
                {ai.marketOverview && (
                  <p className="text-[13px] text-slate-600 leading-relaxed mb-2">
                    {ai.marketOverview}
                    {isStreaming && !ai.medianPrice && <span className="animate-pulse text-blue-400">|</span>}
                  </p>
                )}
                {ai.medianPrice && (
                  <p className="text-[13px] text-slate-700 leading-relaxed">
                    中位价 <strong>{ai.medianPrice}</strong>
                    <span className="ml-1 text-slate-500">
                      （周环比{ai.priceChange}）
                    </span>
                    ，库存 <strong>{ai.inventory}</strong> 套
                    {ai.newListings > 0 && <>，新增 <strong>{ai.newListings}</strong> 套</>}
                  </p>
                )}
              </div>
            )}

            {ai.listings.length > 0 && (
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">新房源</p>
                <div className="space-y-1">
                  {ai.listings.map((l) => (
                    <div key={l.address} className="flex items-baseline justify-between text-[13px] py-1">
                      <span className="text-slate-700">{l.address}</span>
                      <span className="text-slate-400 text-xs ml-2 shrink-0">
                        {l.price} · {l.beds}bd/{l.baths}ba
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(ai.linkedinDraft || (isStreaming && ai.medianPrice)) && (
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">LinkedIn 草稿</p>
                <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line">
                  {ai.linkedinDraft}
                  {isStreaming && ai.linkedinDraft && ai.emailDrafts.length === 0 && (
                    <span className="animate-pulse text-blue-400">|</span>
                  )}
                </p>
              </div>
            )}

            {ai.emailDrafts.length > 0 && (
              <div>
                <button
                  onClick={() => setEmailsOpen(!emailsOpen)}
                  className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
                >
                  {emailsOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                  {ai.emailDrafts.length} 封邮件草稿
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
          <p className="text-sm text-slate-400">{event.description ?? "无更多详情"}</p>
        )}
      </div>

      {/* actions */}
      {ai && !isStreaming && (
        <div className="shrink-0 border-t border-slate-100 px-5 py-3.5 space-y-2.5">
          {isDraft && (
            <div className="flex gap-2">
              <Button
                onClick={() => confirmEvent(event.id)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg h-9 text-[13px]"
              >
                <Check className="size-3.5 mr-1" /> 确认发布
              </Button>
              <Button
                variant="outline"
                onClick={() => skipEvent(event.id)}
                className="rounded-lg h-9 text-[13px] px-3"
              >
                <SkipForward className="size-3.5 mr-1" /> 跳过
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            {isDraft && trustMode === "confirm" && (
              <button
                onClick={() => setTrustMode("auto")}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Unlock className="size-3" /> 以后不用确认，直接发
              </button>
            )}
            {trustMode === "auto" && (
              <button
                onClick={() => setTrustMode("confirm")}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Lock className="size-3" /> 改回需要确认
              </button>
            )}
            {isActioned && trustMode === "confirm" && (
              <span className="text-[11px] text-slate-300">
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
