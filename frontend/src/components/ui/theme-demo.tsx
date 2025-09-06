import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeDemo() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Theme Settings</CardTitle>
        <CardDescription>
          Current theme: <Badge variant="secondary">{theme}</Badge>
          {theme === 'system' && (
            <span className="text-xs text-muted-foreground ml-2">
              (resolved to {resolvedTheme})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium">Choose Theme:</h4>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              System
            </Button>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Quick toggle:</span>
            <ThemeToggle />
          </div>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>The theme is automatically saved and will persist across browser sessions.</p>
        </div>
      </CardContent>
    </Card>
  );
}
