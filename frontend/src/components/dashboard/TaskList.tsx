import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { dashboardService, Task } from "@/lib/dashboardService";

const statusStyles = {
  "To-Do": "bg-gray-100 text-gray-800 border-gray-200",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
  "Done": "bg-green-100 text-green-800 border-green-200",
  "Blocked": "bg-red-100 text-red-800 border-red-200",
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
};

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const recentTasks = await dashboardService.getRecentTasks(10);
        setTasks(recentTasks);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filterTasks = (tasks: Task[], filter: string) => {
    switch (filter) {
      case "todo":
        return tasks.filter(task => task.status === "To-Do");
      case "progress":
        return tasks.filter(task => task.status === "In Progress");
      case "done":
        return tasks.filter(task => task.status === "Done");
      default:
        return tasks;
    }
  };

  const filteredTasks = filterTasks(tasks, activeTab);
  const todoCount = tasks.filter(task => task.status === "To-Do").length;
  const progressCount = tasks.filter(task => task.status === "In Progress").length;
  const doneCount = tasks.filter(task => task.status === "Done").length;

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading tasks...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">
              All
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {tasks.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="todo" className="text-xs">
              To Do
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {todoCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="progress" className="text-xs">
              Progress
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {progressCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="done" className="text-xs">
              Done
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {doneCount}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="space-y-3 mt-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {tasks.length === 0 ? "No tasks found" : "No tasks match the selected filter"}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted/50">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-relaxed">{task.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{task.project.name}</span>
                      {task.assignee && (
                        <>
                          <span>•</span>
                          <span>Assigned to {task.assignee.name}</span>
                        </>
                      )}
                      {task.dueDate && (
                        <>
                          <span>•</span>
                          <span>Due {formatDate(task.dueDate)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={statusStyles[task.status as keyof typeof statusStyles]}
                  >
                    {task.status}
                  </Badge>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}