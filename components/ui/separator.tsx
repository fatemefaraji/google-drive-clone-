"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const separatorVariants = cva(
  "shrink-0 transition-all",
  {
    variants: {
      orientation: {
        horizontal: "h-[1px] w-full",
        vertical: "h-full w-[1px]",
      },
      variant: {
        default: "bg-border",
        subtle: "bg-border/50",
        gradient: "bg-gradient-to-r from-transparent via-border to-transparent",
        dashed: "bg-transparent border-0 border-dashed border-b",
      },
      size: {
        thin: "h-[1px] w-[1px]",
        medium: "h-[2px] w-[2px]",
        thick: "h-[4px] w-[4px]",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      variant: "default",
      size: "thin",
    },
  }
)

interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
    VariantProps<typeof separatorVariants> {
  animate?: boolean
  label?: string
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    {
      className,
      orientation = "horizontal",
      variant = "default",
      size = "thin",
      decorative = true,
      animate = false,
      label,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme()
    return (
      <motion.div
        initial={animate ? { scale: orientation === "horizontal" ? 0 : 1, opacity: 0 } : { opacity: 1 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={cn("relative flex items-center justify-center", orientation === "vertical" && "h-full")}
      >
        <SeparatorPrimitive.Root
          ref={ref}
          decorative={decorative}
          orientation={orientation}
          className={cn(
            separatorVariants({ orientation, variant, size }),
            theme === "dark" ? "bg-gray-700/50" : "bg-gray-200/50",
            label && "bg-transparent",
            className
          )}
          {...props}
        />
        {label && (
          <span
            className={cn(
              "absolute px-2 text-sm font-medium text-muted-foreground",
              theme === "dark" ? "bg-gray-900" : "bg-white",
              orientation === "horizontal" ? "transform -translate-y-1/2" : "transform -translate-x-1/2 rotate-90"
            )}
          >
            {label}
          </span>
        )}
      </motion.div>
    )
  }
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator, type SeparatorProps }