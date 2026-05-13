import { useState } from "react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import {
  Check,
  Pencil,
  SkipForward,
  Unlock,
  Mail,
  Send,
  X,
  TrendingUp,
  TrendingDown,
  Home,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCalendarStore } from "@/stores/calendarStore"
import { useUserStore } from "@/stores/userStore"
import type { CalendarEvent } from "@/types"

interface EventDetailProps {
  event: CalendarEvent
}

export function EventDetail({ event }: EventDetailProps) {
  const selectEvent = useCalendarStore((s) => s.selectEvent)
  const updateEventStatus = useCalendarStore((s) => s.updateEventStatus)
  const removeEvent = useCalendarStore((s) => s.removeEvent)
  const markEmailSent = useCalendarStore((s) => s.markEmailSent)
  const markAllEmailsSent = useCalendarStore((s) => s.markAllEmailsSent)
  const updateEventLinkedin = useCalendarStore((s) => s.updateEventLinkedin)
  const toggleAutoPublish = useUserStore((s) => s.toggleAutoPublish)

  const [editing, setEditing] = useState(false)
  const [editDraft, setEditDraft] = useState(event.linkedinDraft ?? "")
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null)
  const [editingEmail, setEditingEmail] = useState<string | null>(null)
  const [emailEditBody, setEmailEditBody] = useState("")

  const handleConfirm = () => {
    updateEventStatus(event.id, "confirmed")
    selectEvent(null)
  }

  const handleEditConfirm = () => {
    updateEventLinkedin(event.id, editDraft)
    updateEventStatus(event.id, "confirmed")
    setEditing(false)
    selectEvent(null)
  }

  const handleSkip = () => {
    removeEvent(event.id)
    selectEvent(null)
  }

  const handleAutoPublish = () => {
    toggleAutoPublish()
    updateEventStatus(event.id, "auto_published")
    selectEvent(null)
  }

  const handleSendAllEmails = () => {
    markAllEmailsSent(event.id)
  }

  const handleSendEmail = (emailId: string) => {
    markEmailSent(event.id, emailId)
    setExpandedEmail(null)
  }

  const startEditingEmail = (emailId: string, body: string) => {
    setEditingEmail(emailId)
    setEmailEditBody(body)
  }

  const allEmailsSent = event.emailDrafts?.every((d) => d.sent) ?? true

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pb-20 bg-black/40 backdrop-blur-sm">
      <div className="relative mx-4 flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-card p-0 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* header - fixed */}
        <div className="shrink-0 flex items-start justify-between gap-4 p-5 pb-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold leading-snug text-foreground">
              {event.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {format(event.startTime, "M月d日 EEEE · HH:mm", { locale: zhCN })}
              {" — "}
              {format(event.endTime, "HH:mm")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => selectEvent(null)}
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-4 px-5 pb-5">
            {/* market overview */}
            {event.marketData && (
              <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                <h3 className="flex items-center gap-1.5 text-sm font-medium">
                  📊 市场概览
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-foreground">
                      ${event.marketData.medianPrice.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-center gap-0.5 text-xs text-muted-foreground">
                      中位价
                      {event.marketData.priceChange >= 0 ? (
                        <TrendingUp className="size-3 text-green-500" />
                      ) : (
                        <TrendingDown className="size-3 text-red-500" />
                      )}
                      <span
                        className={
                          event.marketData.priceChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {event.marketData.priceChange > 0 ? "+" : ""}
                        {event.marketData.priceChange}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">
                      {event.marketData.inventory}
                    </div>
                    <div className="text-xs text-muted-foreground">在售库存</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">
                      {event.marketData.newListings}
                    </div>
                    <div className="text-xs text-muted-foreground">新增房源</div>
                  </div>
                </div>

                {event.marketData.listings.length > 0 && (
                  <>
                    <Separator />
                    <h4 className="flex items-center gap-1.5 text-sm font-medium">
                      <Home className="size-3.5" />
                      新房源摘要
                    </h4>
                    <div className="space-y-2">
                      {event.marketData.listings.map((listing) => (
                        <div
                          key={listing.address}
                          className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm"
                        >
                          <span className="font-medium">{listing.address}</span>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              ${listing.price.toLocaleString()}
                            </span>
                            <span>
                              {listing.beds}bed/{listing.baths}bath
                            </span>
                            <Badge variant="secondary" className="text-[10px]">
                              第{listing.daysOnMarket}天
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* linkedin draft */}
            {event.linkedinDraft && (
              <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                <h3 className="text-sm font-medium">
                  ✉️ LinkedIn 帖子草稿
                </h3>
                {editing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-y"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleEditConfirm}>
                        <Check className="size-3.5" />
                        确认修改并发布
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing(false)
                          setEditDraft(event.linkedinDraft ?? "")
                        }}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <blockquote className="border-l-2 border-primary/30 pl-3 text-sm italic text-muted-foreground leading-relaxed">
                    {event.linkedinDraft}
                  </blockquote>
                )}
              </div>
            )}

            {/* email drafts */}
            {event.emailDrafts && event.emailDrafts.length > 0 && (
              <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-1.5 text-sm font-medium">
                    <Mail className="size-3.5" />
                    {event.emailDrafts.length} 封推广邮件草稿
                  </h3>
                  {allEmailsSent ? (
                    <Badge variant="secondary" className="text-[10px] text-green-600">
                      <CheckCircle2 className="size-3 mr-0.5" />
                      全部已发送
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      {event.emailDrafts.filter((d) => d.sent).length}/{event.emailDrafts.length} 已发送
                    </span>
                  )}
                </div>

                {/* email list - always visible as summary */}
                <div className="space-y-2">
                  {event.emailDrafts.map((email) => {
                    const isExpanded = expandedEmail === email.id
                    const isEditing = editingEmail === email.id

                    return (
                      <div
                        key={email.id}
                        className="rounded-lg bg-background border border-border/50 overflow-hidden"
                      >
                        {/* email header row */}
                        <button
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            setExpandedEmail(isExpanded ? null : email.id)
                            if (isEditing) setEditingEmail(null)
                          }}
                        >
                          {isExpanded ? (
                            <ChevronUp className="size-3.5 shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                          )}
                          <div className="min-w-0 flex-1 text-left">
                            <p className="font-medium truncate text-xs">
                              {email.subject}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              → {email.recipient}
                            </p>
                          </div>
                          {email.sent ? (
                            <Badge variant="secondary" className="text-[10px] text-green-600 shrink-0">
                              <CheckCircle2 className="size-3 mr-0.5" />
                              已发送
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              待发送
                            </Badge>
                          )}
                        </button>

                        {/* expanded body */}
                        {isExpanded && (
                          <div className="border-t border-border/50 px-3 py-3 space-y-3">
                            {isEditing ? (
                              <div className="space-y-2">
                                <textarea
                                  autoFocus
                                  value={emailEditBody}
                                  onChange={(e) => setEmailEditBody(e.target.value)}
                                  rows={5}
                                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring resize-y leading-relaxed"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="xs"
                                    onClick={() => {
                                      handleSendEmail(email.id)
                                      setEditingEmail(null)
                                    }}
                                  >
                                    <Send className="size-3" />
                                    修改并发送
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => setEditingEmail(null)}
                                  >
                                    取消
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                                  {email.body}
                                </p>
                                {!email.sent && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="xs"
                                      onClick={() => handleSendEmail(email.id)}
                                    >
                                      <Send className="size-3" />
                                      发送
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="xs"
                                      onClick={() => startEditingEmail(email.id, email.body)}
                                    >
                                      <Pencil className="size-3" />
                                      编辑
                                    </Button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* batch action */}
                {!allEmailsSent && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleSendAllEmails}
                  >
                    <Send className="size-3" />
                    全部发送
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* action bar - fixed at bottom */}
        {event.status === "draft" && (
          <div className="shrink-0">
            <Separator />
            <div className="flex flex-wrap gap-2 p-4">
              <Button size="sm" onClick={handleConfirm}>
                <Check className="size-3.5" />
                确认发布
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                disabled={editing || !event.linkedinDraft}
              >
                <Pencil className="size-3.5" />
                编辑后发布
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                <SkipForward className="size-3.5" />
                今天跳过
              </Button>
              <Button variant="ghost" size="sm" onClick={handleAutoPublish}>
                <Unlock className="size-3.5" />
                以后不用确认
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
