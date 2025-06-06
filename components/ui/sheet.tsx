"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SheetPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50",
          theme === "dark" ? "bg-black/80" : "bg-black/60",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "backdrop-blur-sm",
          className
        )}
        {...props}
        ref={ref}
      />
    </motion.div>
  )
})
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 p-6 shadow-xl transition-all ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-full sm:w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-md",
        right:
          "inset-y-0 right-0 h-full w-full sm:w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-md",
      },
      variant: {
        default: "bg-background text-foreground",
        destructive: "bg-destructive text-destructive-foreground border-destructive",
        secondary: "bg-secondary text-secondary-foreground border-secondary",
      },
    },
    defaultVariants: {
      side: "right",
      variant: "default",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  showClose?: boolean
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onInteractOutside?: (event: Event) => void
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", variant = "default", className, children, showClose = true, onEscapeKeyDown, onInteractOutside, ...props }, ref) => {
  const { theme } = useTheme()
  return (
    <SheetPortal>
      <SheetOverlay />
      <motion.div
        initial={{ x: side === "right" ? "100%" : side === "left" ? "-100%" : 0, y: side === "top" ? "-100%" : side === "bottom" ? "100%" : 0 }}
        animate={{ x: 0, y: 0 }}
        exit={{ x: side === "right" ? "100%" : side === "left" ? "-100%" : 0, y: side === "top" ? "-100%" : side === "bottom" ? "100%" : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <SheetPrimitive.Content
          ref={ref}
          className={cn(
            sheetVariants({ side, variant }),
            theme === "dark" ? "bg-gray-900/95" : "bg-white/95",
            "rounded-lg sm:rounded-none",
            "backdrop-blur-sm border",
            className
          )}
          onEscapeKeyDown={onEscapeKeyDown}
          onInteractOutside={onInteractOutside}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {showClose && (
            <SheetPrimitive.Close
              className={cn(
                "absolute right-4 top-4 rounded-full p-2",
                "ring-offset-background transition-all",
                "hover:bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:pointer-events-none",
                variant === "destructive" ? "text-destructive-foreground" : "text-foreground"
              )}
            >
              <Cross2Icon className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </SheetPrimitive.Close>
          )}
          <div className="overflow-y-auto max-h-screen p-1">
            {children}
          </div>
        </SheetPrimitive.Content>
      </motion.div>
    </SheetPortal>
  )
})
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-3 text-center sm:text-left border-b pb-4",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:space-x-3 border-t pt-4",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-xl font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-base text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}