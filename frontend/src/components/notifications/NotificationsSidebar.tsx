import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { apiRequest, API_ENDPOINTS, isAuthenticated } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: number;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface NotificationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsSidebar({ isOpen, onClose }: NotificationsSidebarProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated before making API call
      if (!isAuthenticated()) {
        console.log('User not authenticated, skipping notifications fetch');
        return;
      }
      
      const response = await apiRequest(`${API_ENDPOINTS.NOTIFICATIONS}?limit=15`);
      if (response.ok) {
        const data: NotificationsResponse = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } else {
        console.error('Failed to fetch notifications:', response.status, response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // Reset state on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      const response = await apiRequest(
        `${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`,
        { method: "PUT" }
      );
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await apiRequest(
        `${API_ENDPOINTS.NOTIFICATIONS}/read-all`,
        { method: "PUT" }
      );
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "project":
        return "📋";
      case "task":
        return "✅";
      case "assignment":
        return "👤";
      case "deadline":
        return "⏰";
      case "comment":
        return "💬";
      default:
        return "📢";
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !notification.read;
    return true;
  });

  // Fetch notifications when sidebar opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40" 
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white/10 dark:bg-black/20 backdrop-blur-xl border-l border-white/20 dark:border-white/10 shadow-2xl shadow-black/25 z-50 transform transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3 border-b border-white/20 dark:border-white/10">
          <div className="flex items-center justify-between">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs gap-1"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="flex-1 h-[calc(100vh-200px)]">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors group cursor-pointer ${
                    !notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  {/* Notification Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="text-base">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed ${
                      !notification.read ? "font-medium" : ""
                    }`}>
                      {notification.content}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-white/20 dark:border-white/10">
          <Button
            variant="outline"
            className="w-full justify-center text-sm"
            onClick={() => {
              onClose();
              navigate('/notifications');
            }}
          >
            View all notifications
          </Button>
        </div>
      </div>
    </>
  );
}
