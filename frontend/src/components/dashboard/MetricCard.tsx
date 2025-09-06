import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: "orange" | "blue" | "yellow";
}

const colorStyles = {
  orange: "bg-gradient-to-br from-orange-400 to-orange-500",
  blue: "bg-gradient-to-br from-blue-400 to-blue-500", 
  yellow: "bg-gradient-to-br from-yellow-400 to-yellow-500",
};

export function MetricCard({ title, value, change, isPositive, icon, color }: MetricCardProps) {
  return (
    <Card className="overflow-hidden shadow-card transition-all duration-300 hover:shadow-elevated">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <div className="flex items-center gap-1 text-sm">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span 
                className={cn(
                  "font-medium",
                  isPositive ? "text-success" : "text-destructive"
                )}
              >
                {change}
              </span>
            </div>
          </div>
          <div className={cn("rounded-full p-3 text-white", colorStyles[color])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}