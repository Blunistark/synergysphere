import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ProgressChart() {
  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Overall Progress</CardTitle>
        <Select defaultValue="all">
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <div className="relative h-48 w-48">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray="220"
              strokeDashoffset="62"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">72%</span>
            <span className="text-sm text-muted-foreground">Completed</span>
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-0">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">95</p>
            <p className="text-xs text-muted-foreground">Total projects</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">26</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">35</p>
            <p className="text-xs text-muted-foreground">Delayed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-destructive">35</p>
            <p className="text-xs text-muted-foreground">On going</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}