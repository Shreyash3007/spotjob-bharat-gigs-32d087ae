
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, type HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm shadow-destructive/20 hover:shadow-md hover:shadow-destructive/30",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-primary to-blue-600 text-primary-foreground hover:opacity-90 shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      animated: {
        true: "relative overflow-hidden btn-shimmer",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animated: false
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// Regular Button without motion effects
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animated, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animated, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// Motion Button with animation effects
interface MotionButtonProps extends Omit<HTMLMotionProps<"button">, "animate" | "whileHover" | "whileTap"> {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  animated?: VariantProps<typeof buttonVariants>["animated"];
  className?: string;
  asChild?: boolean;
  whileHover?: any;
  whileTap?: any;
}

const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ className, variant, size, animated, whileHover, whileTap, ...props }, ref) => {
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, animated, className }))}
        ref={ref}
        whileHover={whileHover || { scale: 1.05 }}
        whileTap={whileTap || { scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        {...props}
      />
    )
  }
)
MotionButton.displayName = "MotionButton"

export { Button, buttonVariants, MotionButton }
