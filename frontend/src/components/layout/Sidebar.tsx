import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  Users, 
  Clock, 
  Folder, 
  Settings,
  Plus,
  HelpCircle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Projects", 
    href: "/projects",
    icon: FolderOpen,
  },
  {
    title: "Tasks",
    href: "/tasks", 
    icon: CheckSquare,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Project template", 
    href: "/templates",
    icon: Folder,
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar">
      {/* Header */}
      <div className="flex items-center gap-3 p-6">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-6 w-6" />
        </Button>
        <div>
          <p className="text-sm font-medium text-sidebar-foreground">Create new</p>
          <p className="text-xs text-sidebar-foreground/70">project</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4">
        {navigationItems.map((item) => {
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

      {/* Help Button */}
      <div className="p-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-primary"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}