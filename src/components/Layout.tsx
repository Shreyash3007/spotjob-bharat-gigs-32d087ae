import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Search, PlusCircle, User, Home, Menu, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import NetworkStatusBanner from "./NetworkStatusBanner";

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
  const [scrolled, setScrolled] = useState(false);
  const { user, isOnline } = useApp();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("resize", checkScreenSize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: "/home", icon: Home, label: "Home" },
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
      <NetworkStatusBanner />
      
      <header className={cn(
        "sticky top-0 z-20 border-b backdrop-blur-md transition-all duration-200",
        scrolled 
          ? "bg-background/95 border-border/60 shadow-sm" 
          : "bg-background/80 border-transparent"
      )}>
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <motion.h1 
                className="text-2xl font-bold cursor-pointer bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent flex items-center"
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 mr-2">
                  <circle cx="12" cy="12" r="10" className="stroke-primary" strokeWidth="2"/>
                  <path 
                    d="M12 8v8M8 12h8" 
                    className="stroke-primary" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                  />
                </svg>
                SpotJob
              </motion.h1>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Beta
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <div className="mr-4 space-x-1">
                <Button variant="ghost" size="sm" onClick={() => navigate('/map')}>How it Works</Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/post-job')}>For Employers</Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/swipe')}>For Workers</Button>
              </div>
              
              <div className="flex items-center space-x-2 border-l pl-4 border-border/60">
                {!user ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/auth?mode=login')}>
                      Log in
                    </Button>
                    <Button onClick={() => navigate('/auth?mode=signup')} size="sm">
                      Get Started
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={() => navigate('/profile')}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden lg:inline">Profile</span>
                  </Button>
                )}
                <ThemeToggle />
              </div>
            </nav>
            
            {/* Mobile menu toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <motion.div 
              className="md:hidden py-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <nav className="flex flex-col space-y-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/map')} className="justify-start">
                  How it Works
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/post-job')} className="justify-start">
                  For Employers
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/swipe')} className="justify-start">
                  For Workers
                </Button>
                <div className="border-t my-2"></div>
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
            </motion.div>
          )}
        </div>
      </header>

      <main className={cn(
        "flex-1 mx-auto w-full", 
        fullHeight ? "h-[calc(100vh-116px)]" : undefined
      )}>
        {children}
      </main>

      {!hideNav && isSmallScreen && (
        <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border shadow-lg z-10">
          <div className="container max-w-7xl mx-auto flex justify-around items-center">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center py-2 text-xs",
                  location.pathname === item.path 
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
                onClick={() => navigate(item.path)}
                disabled={!isOnline && item.path !== '/profile'} // Disable navigation when offline except for profile
              >
                <item.icon className={cn(
                  "h-5 w-5 mb-1",
                  location.pathname === item.path 
                    ? "text-primary"
                    : "text-muted-foreground"
                )} />
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
