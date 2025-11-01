"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-10 w-fit items-center justify-center rounded-xl p-1",
        "backdrop-blur-lg bg-black/30 border border-white/10",
        "shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-1",
        "text-sm font-medium whitespace-nowrap transition-all duration-200",
        "text-gray-400 hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:text-white",
        "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20",
        "data-[state=active]:border data-[state=active]:border-white/20",
        "data-[state=active]:shadow-[0_2px_8px_0_rgba(59,130,246,0.15)]",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-lg",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
