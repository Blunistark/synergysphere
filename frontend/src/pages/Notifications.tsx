import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Filter, Search, Trash2, AlertCircle, CheckCircle, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiRequest, API_ENDPOINTS, isAuthenticated } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Fetch notifications
  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      
      // Check if user is authenticated before making API call
      if (!isAuthenticated()) {
        console.log('User not authenticated, skipping notifications fetch');
        toast({
          title: "Authentication Required",
          description: "Please log in to view notifications",
          variant: "destructive",
        });
        return;
      }
      
      const response = await apiRequest(`${API_ENDPOINTS.NOTIFICATIONS}?page=${page}&limit=20`);
      if (response.ok) {
        const data: NotificationsResponse = await response.json();
        if (page === 1) {
          setNotifications(data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }
        setUnreadCount(data.unreadCount);
        setCurrentPage(page);
        setTotalPages(data.pagination.pages);
      } else {
        console.error('Failed to fetch notifications:', response.status, response.statusText);
        toast({
          title: "Error",
          description: "Failed to fetch notifications",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: "Notification marked as read",
        });
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: "All notifications marked as read",
        });
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await apiRequest(
        `${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`,
        { method: "DELETE" }
      );
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        toast({
          title: "Success",
          description: "Notification deleted",
        });
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
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

  // Get notification icon and color based on type
  const getNotificationDetails = (type: string) => {
    switch (type) {
      case "project":
        return { icon: <AlertCircle className="h-5 w-5" />, color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/20" };
      case "task":
        return { icon: <CheckCircle className="h-5 w-5" />, color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/20" };
      case "assignment":
        return { icon: <Clock className="h-5 w-5" />, color: "text-orange-500", bgColor: "bg-orange-100 dark:bg-orange-900/20" };
      case "deadline":
        return { icon: <AlertCircle className="h-5 w-5" />, color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900/20" };
      case "comment":
        return { icon: <MessageSquare className="h-5 w-5" />, color: "text-purple-500", bgColor: "bg-purple-100 dark:bg-purple-900/20" };
      default:
        return { icon: <Bell className="h-5 w-5" />, color: "text-gray-500", bgColor: "bg-gray-100 dark:bg-gray-900/20" };
    }
  };

  // Filter notifications
  useEffect(() => {
    let filtered = notifications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    // Filter by status
    if (filterStatus === "unread") {
      filtered = filtered.filter(notification => !notification.read);
    } else if (filterStatus === "read") {
      filtered = filtered.filter(notification => notification.read);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, filterType, filterStatus]);

  // Load more notifications
  const loadMore = () => {
    if (currentPage < totalPages && !loading) {
      fetchNotifications(currentPage + 1);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} className="gap-2">
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-4">
              {loading && filteredNotifications.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Loading notifications...</p>
                  </div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No notifications found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {searchTerm || filterType !== "all" || filterStatus !== "all"
                        ? "Try adjusting your filters"
                        : "You're all caught up!"}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {filteredNotifications.map((notification) => {
                    const details = getNotificationDetails(notification.type);
                    return (
                      <Card key={notification.id} className={`transition-all hover:shadow-md ${
                        !notification.read ? "ring-2 ring-blue-200 dark:ring-blue-800" : ""
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`p-2 rounded-lg ${details.bgColor} flex-shrink-0`}>
                              <div className={details.color}>
                                {details.icon}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className={`text-sm leading-relaxed ${
                                    !notification.read ? "font-medium text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                                  }`}>
                                    {notification.content}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {notification.type}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {formatTimeAgo(notification.createdAt)}
                                    </span>
                                    {!notification.read && (
                                      <Badge variant="default" className="text-xs">
                                        New
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => markAsRead(notification.id)}
                                      className="h-8 w-8 p-0"
                                      title="Mark as read"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteNotification(notification.id)}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title="Delete notification"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Load More Button */}
                  {currentPage < totalPages && (
                    <div className="flex justify-center py-6">
                      <Button 
                        variant="outline" 
                        onClick={loadMore} 
                        disabled={loading}
                        className="gap-2"
                      >
                        {loading ? "Loading..." : "Load More"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
