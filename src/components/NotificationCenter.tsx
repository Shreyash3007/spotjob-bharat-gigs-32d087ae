import { useState, useEffect } from "react";
import { Bell, BellOff, CheckCircle2, MessageSquare, Briefcase, Star, Settings, X, Eye } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { 
  fetchUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  subscribeToUserNotifications, 
  Notification,
  NotificationType 
} from "@/lib/notifications";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useApp();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) return;
    
    // Load notifications on mount
    loadNotifications();
    
    // Subscribe to real-time notifications
    const unsubscribe = subscribeToUserNotifications(user.id, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(count => count + 1);
      
      // Display a toast for new notifications
      toast.info(
        <div className="flex flex-col">
          <span className="font-semibold">{newNotification.title}</span>
          <span className="text-sm">{newNotification.message}</span>
        </div>
      );
    });
    
    return () => {
      unsubscribe();
    };
  }, [user]);
  
  const loadNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await fetchUserNotifications(user.id);
      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      
      setUnreadCount(count => Math.max(0, count - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      await markAllNotificationsAsRead(user.id);
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };
  
  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
      
      // Update unread count if needed
      const deleted = notifications.find(n => n.id === notificationId);
      if (deleted && !deleted.is_read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.entity_id) {
      switch (notification.type) {
        case NotificationType.APPLICATION:
          navigate(`/job/${notification.entity_id}`);
          break;
        case NotificationType.JOB_STATUS:
          navigate(`/job/${notification.entity_id}`);
          break;
        case NotificationType.REVIEW:
          navigate(`/profile`);
          break;
        case NotificationType.MESSAGE:
          // If we had in-app messaging, navigate to the conversation
          break;
        default:
          // For other types, no navigation
          break;
      }
    }
    
    setIsOpen(false);
  };
  
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.APPLICATION:
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case NotificationType.MESSAGE:
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case NotificationType.JOB_STATUS:
        return <CheckCircle2 className="h-4 w-4 text-purple-500" />;
      case NotificationType.REVIEW:
        return <Star className="h-4 w-4 text-yellow-500" />;
      case NotificationType.ADMIN:
        return <Settings className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // If user is not logged in, don't show notification center
  if (!user) return null;
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative" 
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] text-xs flex items-center justify-center bg-primary text-white px-1"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                <BellOff className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-h-[70vh] overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <span className="text-muted-foreground">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <BellOff className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`
                    border-b last:border-b-0 p-4 cursor-pointer group
                    ${notification.is_read ? 'bg-white' : 'bg-primary/5'}
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex">
                    <div className="mr-3 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <p className={`font-medium ${!notification.is_read ? 'text-primary' : ''}`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-400 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification.id);
                            }}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
} 