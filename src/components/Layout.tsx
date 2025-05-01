
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Search, PlusCircle, User, Home, Menu, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
  fullHeight?: boolean;
}

const Layout = ({ children, hideNav = false, fullHeight = false }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useApp();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/map", icon: MapPin, label: "Map" },
    { path: "/swipe", icon: Search, label: "Browse" },
    { path: "/post-job", icon: PlusCircle, label: "Post" },
    { path: user ? "/profile" : "/auth", icon: user ? User : LogIn, label: user ? "Profile" : "Login" }
  ];

  return (
    <div className={cn(
      "flex flex-col w-full bg-background",
      fullHeight ? "h-screen" : "min-h-screen"
    )}>
      <header className="sticky top-0 z-20 bg-background border-b border-border shadow-sm backdrop-blur-sm bg-background/80">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h1 
                className="text-2xl font-bold text-primary cursor-pointer bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
                onClick={() => navigate('/')}
              >
                SpotJob
              </h1>
              <span className="text-xs bg-accent text-primary px-2 py-0.5 rounded-full">
                Beta
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "rounded-md",
                    location.pathname === item.path 
                      ? "bg-primary text-primary-foreground" 
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
              <ThemeToggle />
            </nav>
            
            {/* Mobile menu toggle */}
            <div className="flex items-center md:hidden">
              <ThemeToggle />
              <button 
                className="p-2 ml-2 rounded-md hover:bg-accent"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 animate-fade-in">
              <nav className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={location.pathname === item.path ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "justify-start w-full",
                      location.pathname === item.path 
                        ? "bg-primary text-primary-foreground" 
                        : "text-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className={cn(
        "flex-1 container max-w-7xl mx-auto px-4 py-6", 
        fullHeight && "h-[calc(100vh-116px)]"
      )}>
        {children}
      </main>

      {!hideNav && isSmallScreen && (
        <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border shadow-lg z-10">
          <div className="container max-w-7xl mx-auto flex justify-around items-center">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={cn(
                  "flex flex-col items-center py-2 px-4 w-full text-xs transition-colors",
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
