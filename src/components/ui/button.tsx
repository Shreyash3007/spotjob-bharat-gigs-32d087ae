
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

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

const ButtonWithAnimation = React.forwardRef<HTMLButtonElement, ButtonProps & { useMotion?: boolean }>(
  ({ className, variant, size, animated, asChild = false, useMotion = false, ...props }, ref) => {
    const Comp = asChild ? Slot : useMotion ? motion.button : "button";
    
    const motionProps = useMotion ? {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
      transition: { duration: 0.2 }
    } : {};

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animated, className }))}
        ref={ref as any}
        {...motionProps}
        {...props}
      />
    )
  }
)
ButtonWithAnimation.displayName = "ButtonWithAnimation"

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return <ButtonWithAnimation {...props} ref={ref} />
  }
)
Button.displayName = "Button"

const MotionButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return <ButtonWithAnimation {...props} useMotion={true} ref={ref} />
  }
)
MotionButton.displayName = "MotionButton"

export { Button, buttonVariants, MotionButton }
