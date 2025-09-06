import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  Users, 
  Clock, 
  Folder, 
  Settings,
  Plus,
  HelpCircle,
  BarChart3,
  FileText,
  Activity,
  ArrowLeft,
  LogOut,
  User
} from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Projects", 
    href: "/projects",
    icon: FolderOpen,
  },
  {
    title: "My Tasks",
    href: "/tasks", 
    icon: CheckSquare,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
];

export function Sidebar() {
  const location = useLocation();
  const { id: projectId } = useParams();
  const { user, logout } = useAuth();
  
  // Check if we're on a project-specific page
  const isProjectPage = location.pathname.startsWith('/projects/') && projectId;
  
  // Project-specific navigation items
  const projectNavigationItems = [
    {
      title: "Project Dashboard",
      href: `/projects/${projectId}/dashboard`,
      icon: BarChart3,
    },
    {
      title: "Project Details",
      href: `/projects/${projectId}`,
      icon: FileText,
    },
    {
      title: "Tasks",
      href: `/projects/${projectId}/tasks`,
      icon: CheckSquare,
    },
    {
      title: "Team",
      href: `/projects/${projectId}/team`,
      icon: Users,
    },
    {
      title: "Activity",
      href: `/projects/${projectId}/activity`,
      icon: Activity,
    },
  ];

  const currentNavigationItems = isProjectPage ? projectNavigationItems : navigationItems;

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    // Use relative URL that will go through nginx proxy in Docker
    if (window.location.hostname === 'localhost' && window.location.port === '3000') {
      return `http://localhost:3000${imagePath}`;
    } else {
      return imagePath;
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar">
      {/* Header - Simplified */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/projects">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm font-medium">Create Project</span>
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {/* Back to Projects button when on project page */}
        {isProjectPage && (
          <Link to="/projects">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-xl px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent mb-4"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">Back to Projects</span>
            </Button>
          </Link>
        )}
        
        {currentNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 rounded-xl px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{item.title}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Details at Bottom */}
      <div className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-3 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user?.profileImage ? getImageUrl(user.profileImage) : `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} 
                />
                <AvatarFallback>
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="h-4 w-4 mr-2" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}