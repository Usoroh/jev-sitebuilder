"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

// Retro-Playful Slider — the filled Range is the poster-blue material from the
// primary Button, and the Thumb is a chunky ink-bordered knob carrying the same
// hard offset shadow, so the control reads as one cut-out poster piece.

const Slider = React.forwardRef<HTMLDivElement, SliderPrimitive.Root.Props>(
  ({ className, defaultValue, value, min = 0, max = 100, ...props }, ref) => {
    const _values = Array.isArray(value)
      ? value
      : Array.isArray(defaultValue)
        ? defaultValue
        : [min, max]

    return (
      <SliderPrimitive.Root
        data-slot="slider"
        ref={ref}
        thumbAlignment="edge"
        defaultValue={defaultValue}
        value={value}
        min={min}
        max={max}
        className={cn("relative w-full", className)}
        {...props}
      >
        <SliderPrimitive.Control className="flex w-full touch-none select-none items-center">
          <SliderPrimitive.Track data-slot="slider-track" className="relative h-2.5 w-full grow overflow-hidden rounded-full border-2 border-border bg-secondary">
            <SliderPrimitive.Indicator data-slot="slider-range" className="absolute h-full bg-primary" />
          </SliderPrimitive.Track>
          {Array.from({ length: _values.length }, (_, index) => (
            <SliderPrimitive.Thumb data-slot="slider-thumb" key={index} className="block h-5 w-5 rounded-full border-2 border-border bg-primary shadow-[var(--shadow-hard-sm)] ring-offset-background transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-disabled:pointer-events-none data-disabled:opacity-50" />
          ))}
        </SliderPrimitive.Control>
      </SliderPrimitive.Root>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
