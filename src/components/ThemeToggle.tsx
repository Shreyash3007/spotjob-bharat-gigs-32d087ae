
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button 
      variant="outline" 
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="relative overflow-hidden border-muted/30 bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground"
    >
      <span className="sr-only">Toggle theme</span>
      
      <div className="relative h-[1.2rem] w-[1.2rem]">
        {theme === 'dark' ? (
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-full w-full" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0, rotate: 90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -90 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-full w-full" />
          </motion.div>
        )}
      </div>
    </Button>
  );
}
