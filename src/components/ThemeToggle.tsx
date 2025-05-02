
import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button 
      variant="outline" 
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="relative overflow-hidden border-muted/30 bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground transition-all duration-500 rounded-full"
    >
      <span className="sr-only">Toggle theme</span>
      
      <div className="relative h-[1.2rem] w-[1.2rem]">
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'dark' ? (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 15 }}
              className="absolute inset-0"
            >
              <Sun className="h-full w-full text-yellow-400" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: 90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: -90, opacity: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 15 }}
              className="absolute inset-0"
            >
              <Moon className="h-full w-full text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Sparkle effects */}
      <AnimatePresence>
        {theme === 'dark' ? (
          <motion.div
            key="dark-sparkles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <motion.div
              className="absolute top-0 right-0"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              <Sparkles className="h-2 w-2 text-yellow-300" />
            </motion.div>
            <motion.div
              className="absolute bottom-1 left-0"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, delay: 0.5 }}
            >
              <Sparkles className="h-2 w-2 text-yellow-300" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      
      {/* Enhanced ripple effect when button is clicked */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-blue-400/10 opacity-0 hover:opacity-100 transition-opacity rounded-full" />
    </Button>
  );
}
