import {
  Linkedin,
  Calendar,
  Clock,
  Home,
  DollarSign,
  MapPin,
  Shield,
  ShieldCheck,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useUserStore } from "@/stores/userStore"

export function UserPanel() {
  const { user, toggleAutoPublish } = useUserStore()
  const prefs = user.preferences
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")

  return (
    <div className="space-y-3">
      {/* profile header */}
      <div className="flex items-center gap-3 px-1">
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user.company}
          </p>
        </div>
      </div>

      {/* role & region */}
      <div className="flex flex-wrap gap-1.5 px-1">
        <Badge variant="secondary" className="text-[10px] gap-1">
          <MapPin className="size-2.5" />
          {user.region}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          {user.role}
        </Badge>
      </div>

      <Separator />

      {/* preferences snapshot */}
      <div className="space-y-2 px-1">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          Agent 配置
        </p>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="size-3 shrink-0" />
            <span>每日推送 {prefs.pushTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Home className="size-3 shrink-0" />
            <span>{prefs.propertyTypes.join("、")}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="size-3 shrink-0" />
            <span>
              ${(prefs.priceRange.min / 1000).toFixed(0)}k — $
              {(prefs.priceRange.max / 1000).toFixed(0)}k
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* connections */}
      <div className="space-y-1.5 px-1">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          已连接服务
        </p>
        <div className="flex items-center gap-2 text-xs">
          <Linkedin className="size-3.5 text-blue-600" />
          <span className="flex-1 text-foreground">LinkedIn</span>
          <span className="text-green-600 text-[10px]">已连接</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="size-3.5 text-foreground" />
          <span className="flex-1 text-foreground">Notion Calendar</span>
          <span className="text-green-600 text-[10px]">已连接</span>
        </div>
      </div>

      <Separator />

      {/* auto-publish toggle */}
      <div className="px-1">
        <Button
          variant={prefs.autoPublish ? "default" : "outline"}
          size="sm"
          className="w-full gap-1.5 text-xs"
          onClick={toggleAutoPublish}
        >
          {prefs.autoPublish ? (
            <>
              <ShieldCheck className="size-3.5" />
              自动发布已开启
            </>
          ) : (
            <>
              <Shield className="size-3.5" />
              需要确认后发布
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
