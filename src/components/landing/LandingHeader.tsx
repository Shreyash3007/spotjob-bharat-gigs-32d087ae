
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface LandingHeaderProps {
  hasScrolled: boolean;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ hasScrolled }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when navigating
  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('.mobile-menu') && !target.closest('.menu-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        hasScrolled
          ? "bg-background/80 backdrop-blur-lg shadow-sm py-3"
          : "bg-transparent py-5"
      )}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <motion.div 
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigate('/')}>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white font-bold text-2xl">S</div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">SpotJob</span>
          </div>
        </motion.div>
        
        <div className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" onClick={() => handleNavigate('/map')}>How It Works</Button>
          <div className="relative group">
            <Button variant="ghost" className="flex items-center gap-1">
              Find Work <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
            <div className="absolute top-full left-0 mt-1 bg-background rounded-md shadow-md border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[180px] z-50">
              <div className="py-1">
                <button 
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors" 
                  onClick={() => handleNavigate('/swipe')}
                >
                  Swipe Jobs
                </button>
                <button 
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors" 
                  onClick={() => handleNavigate('/jobs')}
                >
                  Browse Listings
                </button>
                <button 
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors" 
                  onClick={() => handleNavigate('/map')}
                >
                  Map View
                </button>
              </div>
            </div>
          </div>
          <Button variant="ghost" onClick={() => handleNavigate('/post-job')}>Post a Job</Button>
        </div>
        
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" onClick={() => handleNavigate('/profile')}>My Profile</Button>
              <Button variant="outline" onClick={() => signOut()}>Log Out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => handleNavigate('/auth?mode=login')}>Login</Button>
              <Button onClick={() => handleNavigate('/auth?mode=signup')}>Sign Up</Button>
            </>
          )}
          
          <div className="border-l pl-3">
            <ThemeToggle />
          </div>
        </div>
        
        <div className="sm:hidden flex items-center">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            className="menu-button ml-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div 
          className="mobile-menu md:hidden absolute top-full left-0 right-0 bg-background border-b shadow-lg z-40"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="container mx-auto px-4 py-4 divide-y">
            <div className="py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Navigation</h3>
              <nav className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => handleNavigate('/swipe')}
                >
                  Find Jobs
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => handleNavigate('/post-job')}
                >
                  Post a Job
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => handleNavigate('/map')}
                >
                  How It Works
                </Button>
              </nav>
            </div>
            
            <div className="py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Account</h3>
              <nav className="space-y-1">
                {user ? (
                  <>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={() => handleNavigate('/profile')}
                    >
                      My Profile
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={() => signOut()}
                    >
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={() => handleNavigate('/auth?mode=login')}
                    >
                      Login
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-primary font-medium" 
                      onClick={() => handleNavigate('/auth?mode=signup')}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </nav>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};
