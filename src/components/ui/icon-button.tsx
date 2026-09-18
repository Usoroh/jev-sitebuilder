import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Retro-Playful Icon Button: square/circle button for icon-only actions
// Based on Linear's button pattern with icon sizes

const iconButtonVariants = cva(
  "relative inline-flex items-center justify-center shrink-0 outline-none border-2 border-border shadow-[var(--shadow-hard-sm)] transition-all duration-150 ease-out focus-visible:outline-none active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-primary/30",
        secondary: "bg-secondary text-foreground hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-foreground/20",
        ghost: "border-transparent shadow-none text-muted-foreground hover:bg-secondary hover:text-foreground active:translate-x-0 active:translate-y-0",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/85",
        outline: "bg-background text-foreground hover:bg-secondary",
      },
      size: {
        xs: "h-7 w-7 rounded-lg text-xs",
        sm: "h-8 w-8 rounded-lg text-sm",
        default: "h-9 w-9 rounded-lg text-sm",
        lg: "h-10 w-10 rounded-lg text-base",
        xl: "h-11 w-11 rounded-lg text-base",
      },
      corners: {
        square: "",
        circle: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
      corners: "square",
    },
  }
)

export interface IconButtonProps
  extends Omit<ButtonPrimitive.Props, "className">,
    VariantProps<typeof iconButtonVariants> {
  className?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, corners, ...props }, ref) => {
    return (
      <ButtonPrimitive
        className={cn(iconButtonVariants({ variant, size, corners, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton, iconButtonVariants }
