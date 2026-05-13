import { useEffect, useRef } from "react"
import { Sparkles } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAgentStore } from "@/stores/agentStore"
import { AgentInputBar } from "./AgentInputBar"
import { ChatOverlay } from "./ChatOverlay"

export function FloatingAgent() {
  const { state, open, close } = useAgentStore()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        if (state === "idle") open()
        else close()
      }
      if (e.key === "Escape" && state !== "idle") {
        close()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [state, open, close])

  useEffect(() => {
    if (state === "idle") return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [state, close])

  return (
    <div
      ref={containerRef}
      className="fixed bottom-8 left-1/2 z-[60] -translate-x-1/2"
    >
      <AnimatePresence mode="wait">
        {state === "idle" ? (
          <motion.div
            key="fab"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <Button
              onClick={open}
              className="h-11 gap-2 rounded-full px-5 shadow-lg shadow-primary/20"
            >
              <Sparkles className="size-4" />
              <span>唤醒助理</span>
              <kbd className="ml-1 rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-mono">
                ⌘K
              </kbd>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="panel"
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.12 }}
            className="relative"
          >
            <ChatOverlay />
            <AgentInputBar />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
