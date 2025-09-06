import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, User } from "lucide-react";
import { dashboardService, Task } from "@/lib/dashboardService";

interface TaskColumn {
  title: string;
  status: string;
  color: string;
  tasks: Task[];
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserTasks();
  }, []);

  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getUserTasks();
      setTasks(response.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Group tasks by status
  const organizeTasksByStatus = (tasks: Task[]): TaskColumn[] => {
    const statusConfig = [
      { title: "To Do", status: "todo", color: "bg-blue-500" },
      { title: "In Progress", status: "in_progress", color: "bg-purple-500" },
      { title: "Review", status: "review", color: "bg-orange-500" },
      { title: "Done", status: "completed", color: "bg-green-500" },
    ];

    return statusConfig.map(config => ({
      ...config,
      tasks: tasks.filter(task => task.status === config.status)
    }));
  };

  const columns = organizeTasksByStatus(tasks);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityNumber = (priority?: string) => {
    switch (priority) {
      case 'high': return '1';
      case 'medium': return '2';
      case 'low': return '3';
      default: return '';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="My Tasks" />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading your tasks...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="My Tasks" />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="My Tasks" />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.title} className="space-y-4">
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{column.title}</h3>
                  <Badge variant="secondary" className={`${column.color} text-white`}>
                    {column.tasks.length}
                  </Badge>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {column.tasks.map((task) => (
                  <Card key={task.id} className="shadow-card hover:shadow-elevated transition-all duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-medium leading-relaxed">
                          {task.title}
                        </CardTitle>
                        {task.priority && (
                          <Badge 
                            variant="outline" 
                            className={`h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs text-white ${getPriorityColor(task.priority)}`}
                          >
                            {getPriorityNumber(task.priority)}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">#{task.id}</span>
                        <Badge 
                          variant="secondary"
                          className={`${column.color} text-white text-xs`}
                        >
                          {column.title}
                        </Badge>
                      </div>
                      
                      {/* Project Info */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{task.project.name}</span>
                      </div>
                      
                      {/* Due Date */}
                      {task.dueDate && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Due {formatDate(task.dueDate)}</span>
                        </div>
                      )}
                      
                      {/* Assignee (current user) */}
                      {task.assignee && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {task.assignee.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {task.assignee.name}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {/* Empty State */}
                {column.tasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No {column.title.toLowerCase()} tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}