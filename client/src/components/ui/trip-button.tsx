
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tripButtonVariants = cva(
  "w-full py-4 px-6 text-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: [
          // Light theme - unpressed (state 1)
          "bg-gray-100 text-gray-700 border border-gray-200",
          "hover:bg-gray-200 hover:text-gray-800",
          // Dark theme - unpressed (state 4)
          "dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
          "dark:hover:bg-gray-700 dark:hover:text-gray-200"
        ],
        pressed: [
          // Light theme - pressed (state 2)
          "bg-gray-300 text-gray-900 border border-gray-400 shadow-inner",
          // Dark theme - pressed (state 3)
          "dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:shadow-inner"
        ]
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TripButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tripButtonVariants> {
  pressed?: boolean
}

const TripButton = React.forwardRef<HTMLButtonElement, TripButtonProps>(
  ({ className, variant, pressed = false, children, ...props }, ref) => {
    const buttonVariant = pressed ? "pressed" : "default"
    
    return (
      <button
        className={cn(tripButtonVariants({ variant: buttonVariant, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TripButton.displayName = "TripButton"

export { TripButton, tripButtonVariants }
