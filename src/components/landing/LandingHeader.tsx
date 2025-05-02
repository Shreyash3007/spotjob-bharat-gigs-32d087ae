
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

interface LandingHeaderProps {
  hasScrolled: boolean;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ hasScrolled }) => {
  const navigate = useNavigate();

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
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white font-bold text-2xl">S</div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">SpotJob</span>
          </div>
          <div className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full ml-2">Beta</div>
        </motion.div>
        
        <div className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" onClick={() => navigate('/map')}>How It Works</Button>
          <Button variant="ghost" onClick={() => navigate('/post-job')}>For Employers</Button>
          <Button variant="ghost" onClick={() => navigate('/swipe')}>For Workers</Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center space-x-3">
            <Button variant="ghost" onClick={() => navigate('/auth?mode=login')}>Login</Button>
            <Button onClick={() => navigate('/auth?mode=signup')}>Sign Up</Button>
          </div>
          <div className="border-l pl-3 hidden sm:block">
            <ThemeToggle />
          </div>
          
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => navigate('/auth')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
