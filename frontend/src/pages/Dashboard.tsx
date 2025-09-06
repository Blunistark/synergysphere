import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ProjectTable } from "@/components/dashboard/ProjectTable";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { TaskList } from "@/components/dashboard/TaskList";
import { WorkloadChart } from "@/components/dashboard/WorkloadChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen, Clock, Users } from "lucide-react";

export default function Dashboard() {
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
                <SelectItem value="30days">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Projects"
              value="95"
              change="10% decrease from last month"
              isPositive={false}
              icon={<FolderOpen className="h-6 w-6" />}
              color="orange"
            />
            <MetricCard
              title="Time spent"
              value="1022"
              change="8% increase from last month"
              isPositive={true}
              icon={<Clock className="h-6 w-6" />}
              color="blue"
            />
            <MetricCard
              title="Resources"
              value="101"
              change="2% increase from last month"
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
            <WorkloadChart />
          </div>
        </div>
      </main>
    </div>
  );
}