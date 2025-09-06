import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Calendar, 
  Clock, 
  User, 
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Circle,
  Play
} from "lucide-react";
import { Task } from "@/lib/dashboardService";

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  icon: React.ReactNode;
  tasks: Task[];
}

interface KanbanBoardProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: number, newStatus: string) => void;
  onTaskClick?: (task: Task) => void;
}

const statusConfig = {
  'todo': { 
    title: 'To Do', 
    color: 'bg-gray-100 border-gray-300', 
    icon: <Circle className="h-4 w-4" />,
    badgeVariant: 'secondary' as const
  },
  'in-progress': { 
    title: 'In Progress', 
    color: 'bg-blue-50 border-blue-300', 
    icon: <Play className="h-4 w-4" />,
    badgeVariant: 'default' as const
  },
  'review': { 
    title: 'In Review', 
    color: 'bg-yellow-50 border-yellow-300', 
    icon: <AlertTriangle className="h-4 w-4" />,
    badgeVariant: 'outline' as const
  },
  'done': { 
    title: 'Completed', 
    color: 'bg-green-50 border-green-300', 
    icon: <CheckCircle className="h-4 w-4" />,
    badgeVariant: 'default' as const
  }
};

// Function to normalize status from database to our standard format
const normalizeStatus = (status: string): string => {
  const normalized = status.toLowerCase().trim().replace(/\s+/g, '-');
  
  // Map various status formats to our standard ones
  switch (normalized) {
    case 'to-do':
    case 'todo':
    case 'pending':
    case 'new':
      return 'todo';
    case 'in-progress':
    case 'in_progress':
    case 'inprogress':
    case 'active':
    case 'working':
      return 'in-progress';
    case 'in-review':
    case 'in_review':
    case 'review':
    case 'reviewing':
      return 'review';
    case 'done':
    case 'completed':
    case 'finished':
    case 'closed':
      return 'done';
    default:
      return normalized;
  }
};

export function KanbanBoard({ tasks, onTaskStatusChange, onTaskClick }: KanbanBoardProps) {
  const { toast } = useToast();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Debug: Log task statuses to console
  console.log('KanbanBoard - Raw tasks:', tasks);
  console.log('KanbanBoard - Unique statuses:', [...new Set(tasks.map(t => t.status))]);

  // Group tasks by status
  const columns: KanbanColumn[] = Object.entries(statusConfig).map(([status, config]) => ({
    id: status,
    title: config.title,
    color: config.color,
    icon: config.icon,
    tasks: tasks.filter(task => normalizeStatus(task.status) === status)
  }));

  // Debug: Log columns with task counts
  console.log('KanbanBoard - Columns:', columns.map(c => ({ id: c.id, title: c.title, taskCount: c.tasks.length })));

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== targetStatus) {
      onTaskStatusChange(draggedTask.id, targetStatus);
      toast({
        title: "Task Updated",
        description: `Task moved to ${statusConfig[targetStatus as keyof typeof statusConfig].title}`,
      });
    }
    setDraggedTask(null);
  };

  const handleStatusChange = (taskId: number, newStatus: string) => {
    onTaskStatusChange(taskId, newStatus);
    toast({
      title: "Task Updated",
      description: `Task status changed to ${statusConfig[newStatus as keyof typeof statusConfig].title}`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && dueDate;
  };

  const getPriorityColor = (status: string) => {
    switch (status) {
      case 'todo': return 'text-gray-600 bg-gray-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'review': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`min-w-80 rounded-lg border-2 border-dashed p-4 ${column.color}`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {column.icon}
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <Badge variant="secondary" className="ml-2">
                {column.tasks.length}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            {column.tasks.map((task) => (
              <Card
                key={task.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  draggedTask?.id === task.id ? 'opacity-50' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                onClick={() => onTaskClick?.(task)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Task Title */}
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm leading-tight pr-2">
                        {task.title}
                      </h4>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {Object.entries(statusConfig).map(([status, config]) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task.id, status);
                              }}
                              disabled={task.status === status}
                            >
                              <div className="flex items-center gap-2">
                                {config.icon}
                                Move to {config.title}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Task Description */}
                    {task.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Task Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        {task.dueDate && (
                          <div className={`flex items-center gap-1 ${
                            isOverdue(task.dueDate) ? 'text-red-600' : ''
                          }`}>
                            <Calendar className="h-3 w-3" />
                            {formatDate(task.dueDate)}
                          </div>
                        )}
                      </div>
                      
                      {task.assignee && (
                        <div className="flex items-center gap-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {task.assignee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <Badge 
                      variant={statusConfig[task.status as keyof typeof statusConfig]?.badgeVariant || 'secondary'}
                      className="text-xs"
                    >
                      {statusConfig[task.status as keyof typeof statusConfig]?.title || task.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {column.tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
