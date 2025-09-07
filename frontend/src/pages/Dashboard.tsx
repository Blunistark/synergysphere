import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ProjectTable } from "@/components/dashboard/ProjectTable";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { TaskList } from "@/components/dashboard/TaskList";
import { WorkloadChart } from "@/components/dashboard/WorkloadChart";
import { ThemeDemo } from "@/components/ui/theme-demo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen, Clock, Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { dashboardService, DashboardStats } from "@/lib/dashboardService.ts";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const stats = await dashboardService.getDashboardStats();
        setDashboardStats(stats);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" />
        <div className="flex-1 p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Dashboard" />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Overview Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Overview</h2>
            <Select defaultValue="30days">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Projects"
              value={dashboardStats?.totalProjects.toString() || "0"}
              change={`${dashboardStats?.totalProjects || 0} active projects`}
              isPositive={true}
              icon={<FolderOpen className="h-6 w-6" />}
              color="orange"
            />
            <MetricCard
              title="Total Tasks"
              value={dashboardStats?.totalTasks.toString() || "0"}
              change={`${dashboardStats?.completedTasks || 0} completed, ${dashboardStats?.pendingTasks || 0} pending`}
              isPositive={dashboardStats ? dashboardStats.completedTasks > dashboardStats.pendingTasks : true}
              icon={<Clock className="h-6 w-6" />}
              color="blue"
            />
            <MetricCard
              title="Team Members"
              value={dashboardStats?.totalUsers.toString() || "0"}
              change={`Across ${dashboardStats?.totalProjects || 0} projects`}
              isPositive={true}
              icon={<Users className="h-6 w-6" />}
              color="yellow"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Project Table */}
            <div className="lg:col-span-2">
              <ProjectTable />
            </div>

            {/* Right Column - Progress Chart */}
            <div>
              <ProgressChart />
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaskList />
            <div className="space-y-6">
              <WorkloadChart />
              {/* Theme Demo - for testing dark mode */}
              <ThemeDemo />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}