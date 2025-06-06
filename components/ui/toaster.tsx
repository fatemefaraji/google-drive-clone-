"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useCallback } from "react"
import { useTheme } from "next-themes"
import { CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react"

type ToastVariant = "default" | "success" | "error" | "info"

interface ToastProps {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: ToastVariant
  duration?: number
  className?: string
}

export function Toaster() {
  const { toasts } = useToast()
  const { theme } = useTheme()
  const toastRef = useRef<Map<string, HTMLDivElement>>(new Map())

  const getVariantStyles = useCallback((variant: ToastVariant) => {
    const baseStyles = "border-l-4"
    const variantStyles: Record<ToastVariant, string> = {
      default: "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200",
      success: "border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-200",
      error: "border-red-500 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200",
      info: "border-purple-500 bg-purple-50 text-purple-900 dark:bg-purple-900/20 dark:text-purple-200",
    }
    return cn(baseStyles, variantStyles[variant])
  }, [])

  const getVariantIcon = useCallback((variant: ToastVariant) => {
    const iconProps = { className: "h-5 w-5 shrink-0" }
    const icons: Record<ToastVariant, React.ReactNode> = {
      default: <Info {...iconProps} />,
      success: <CheckCircle2 {...iconProps} />,
      error: <XCircle {...iconProps} />,
      info: <Info {...iconProps} />,
    }
    return icons[variant]
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toastRef.current.forEach((_, id) => {
          // Assuming dismissToast is available from useToast
          // This is a placeholder for toast dismissal logic
        })
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <ToastProvider>
      <AnimatePresence>
        {toasts.map(({ id, title, description, action, variant = "default", duration, className, ...props }: ToastProps) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            layout
          >
            <Toast
              ref={(el) => {
                if (el) toastRef.current.set(id, el)
                else toastRef.current.delete(id)
              }}
              className={cn(
                "relative flex items-start gap-3 p-4 rounded-lg shadow-lg",
                getVariantStyles(variant),
                theme === "dark" ? "bg-gray-800/95" : "bg-white/95",
                "backdrop-blur-sm border",
                className
              )}
              {...props}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <div className="flex-shrink-0">{getVariantIcon(variant)}</div>
              <div className="grid gap-1 flex-1">
                {title && (
                  <ToastTitle className="font-semibold text-sm leading-tight">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="text-sm leading-relaxed">
                    {description}
                  </ToastDescription>
                )}
              </div>
              {action && (
                <div className="flex items-center gap-2">
                  {action}
                </div>
              )}
              <ToastClose className="absolute top-2 right-2 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" />
            </Toast>
          </motion.div>
        ))}
      </AnimatePresence>
      <ToastViewport
        className={cn(
          "fixed bottom-0 right-0 z-[1000] flex flex-col gap-3 p-4 w-full max-w-md",
          "sm:bottom-4 sm:right-4 sm:w-[380px]"
        )}
      />
    </ToastProvider>
  )
}