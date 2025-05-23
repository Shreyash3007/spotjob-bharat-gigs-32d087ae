
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { motion, AnimatePresence } from "framer-motion"
import React from "react"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ children, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleContent
    ref={ref}
    {...props}
    className="overflow-hidden"
  >
    <AnimatePresence initial={false}>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: "auto", 
          opacity: 1,
          transition: { 
            height: { 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.4
            },
            opacity: { duration: 0.5, ease: "easeOut" }
          }
        }}
        exit={{ 
          height: 0, 
          opacity: 0,
          transition: { 
            height: { 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3
            },
            opacity: { duration: 0.2, ease: "easeIn" }
          }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  </CollapsiblePrimitive.CollapsibleContent>
))

CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
