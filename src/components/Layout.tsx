
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Search, PlusCircle, User, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
  fullHeight?: boolean;
}

const Layout = ({ children, hideNav = false, fullHeight = false }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/map", icon: MapPin, label: "Map" },
    { path: "/swipe", icon: Search, label: "Browse" },
    { path: "/post-job", icon: PlusCircle, label: "Post" },
    { path: "/profile", icon: User, label: "Profile" }
  ];

  return (
    <div className={cn(
      "flex flex-col w-full bg-background",
      fullHeight ? "h-screen" : "min-h-screen"
    )}>
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-spotjob-purple">
              SpotJob
            </h1>
            <span className="text-xs bg-spotjob-lightPurple text-spotjob-purple px-2 py-0.5 rounded-full">
              Beta
            </span>
          </div>
        </div>
      </header>

      <main className={cn(
        "flex-1 container max-w-7xl mx-auto px-4 py-4", 
        fullHeight && "h-[calc(100vh-116px)]"
      )}>
        {children}
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
          <div className="container max-w-7xl mx-auto flex justify-around items-center">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={cn(
                  "flex flex-col items-center py-2 px-4 w-full text-xs transition-colors",
                  location.pathname === item.path
                    ? "text-spotjob-purple"
                    : "text-gray-500 hover:text-spotjob-purple"
                )}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-5 w-5 mb-1" />
                {!isSmallScreen && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
