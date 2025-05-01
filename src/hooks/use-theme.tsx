
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light"
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "spotjob-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both modes first to avoid transitions conflicts
    root.classList.remove("light", "dark");
    
    let resolvedMode: "light" | "dark" = "light";
    
    if (theme === "system") {
      resolvedMode = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      resolvedMode = theme as "light" | "dark";
    }
    
    root.classList.add(resolvedMode);
    setResolvedTheme(resolvedMode);
    
    // Apply smooth transition to all elements when changing themes
    root.style.setProperty('--theme-transition', 'background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease, fill 0.5s ease, stroke 0.5s ease');
    document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';

    // Set additional custom CSS properties for different themes
    if (resolvedMode === "dark") {
      document.body.style.setProperty('--sidebar-primary', 'hsl(260, 84%, 60%)');
      document.body.style.setProperty('--sidebar-background', 'hsl(222, 47%, 11%)');
      document.body.setAttribute('data-theme', 'dark');
      
      // Add glass effect to specific elements
      document.querySelectorAll('.glass-effect').forEach((el) => {
        (el as HTMLElement).style.backdropFilter = 'blur(10px)';
        (el as HTMLElement).style.backgroundColor = 'rgba(15, 23, 42, 0.75)';
        (el as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
      });
    } else {
      document.body.style.setProperty('--sidebar-primary', 'hsl(260, 84%, 60%)');
      document.body.style.setProperty('--sidebar-background', 'hsl(0, 0%, 100%)');
      document.body.setAttribute('data-theme', 'light');
      
      // Add glass effect to specific elements
      document.querySelectorAll('.glass-effect').forEach((el) => {
        (el as HTMLElement).style.backdropFilter = 'blur(10px)';
        (el as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.75)';
        (el as HTMLElement).style.borderColor = 'rgba(0, 0, 0, 0.1)';
      });
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement;
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        
        root.classList.remove("light", "dark");
        root.classList.add(systemTheme);
        setResolvedTheme(systemTheme);
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    resolvedTheme
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
