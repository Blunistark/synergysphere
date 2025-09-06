import { 
  Search, 
  Settings, 
  Bell, 
  HelpCircle, 
  Moon, 
  Sun, 
  Monitor,
  Palette,
  Globe,
  Shield
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [notifications, setNotifications] = useState(true);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    // TODO: Implement actual theme switching logic
    console.log('Theme changed to:', newTheme);
  };

  const handleNotificationToggle = () => {
    setNotifications(!notifications);
    console.log('Notifications:', !notifications ? 'enabled' : 'disabled');
  };

  const handleHelp = () => {
    console.log('Opening help documentation');
    // TODO: Open help modal or navigate to help page
  };

  const handlePrivacySettings = () => {
    console.log('Opening privacy settings');
    // TODO: Open privacy settings modal
  };

  const handleLanguageSettings = () => {
    console.log('Opening language settings');
    // TODO: Open language settings modal
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for anything..."
            className="w-80 pl-10 pr-4"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {notifications && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
              3
            </Badge>
          )}
        </Button>

        {/* Help */}
        <Button variant="ghost" size="sm" onClick={handleHelp}>
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* Application Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Theme Settings */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="mr-2 h-4 w-4" />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                  {theme === 'light' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                  {theme === 'dark' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange('system')}>
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System</span>
                  {theme === 'system' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* Notification Settings */}
            <DropdownMenuItem onClick={handleNotificationToggle}>
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
              <span className="ml-auto">{notifications ? '✓' : ''}</span>
            </DropdownMenuItem>

            {/* Language Settings */}
            <DropdownMenuItem onClick={handleLanguageSettings}>
              <Globe className="mr-2 h-4 w-4" />
              <span>Language</span>
            </DropdownMenuItem>

            {/* Privacy Settings */}
            <DropdownMenuItem onClick={handlePrivacySettings}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Privacy & Security</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* General Settings */}
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>General Settings</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}