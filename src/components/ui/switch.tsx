import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import { springInteraction } from "@/lib/motion"

// Retro-Playful Switch — checked track is a poster-blue slab matching the
// primary Button (same fill + chunky ink border-2 + hard offset). The thumb is a
// paper knob with its own ink border, like a cut-out sticker.

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-disabled:cursor-not-allowed data-disabled:opacity-50 data-unchecked:bg-secondary data-checked:bg-primary data-checked:shadow-[var(--shadow-hard-sm)]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        render={
          <motion.span
            layout
            transition={springInteraction}
            className="pointer-events-none block h-5 w-5 rounded-full border-2 border-border bg-card ring-0 data-checked:translate-x-5 data-unchecked:translate-x-0.5"
          />
        }
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
