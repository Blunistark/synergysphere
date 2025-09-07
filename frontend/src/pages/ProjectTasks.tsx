import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { BreadcrumbItem } from "@/hooks/useBreadcrumbs";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  MoreVertical,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  List,
  LayoutGrid,
  Circle
} from "lucide-react";
import { dashboardService, Project, Task } from "@/lib/dashboardService";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProjectTasks() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    if (id) {
      fetchProjectAndTasks(id);
    }
  }, [id]);

  useEffect(() => {
    // Filter tasks based on search term and status
    console.log('All tasks:', tasks);
    console.log('Current filters - search:', searchTerm, 'status:', statusFilter);
    
    let filtered = tasks;
    
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(task => normalizeStatus(task.status) === statusFilter);
    }
    
    console.log('Filtered tasks:', filtered);
    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter]);

  const fetchProjectAndTasks = async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch project details
      const projectResponse = await dashboardService.getProjects();
      const foundProject = projectResponse.projects.find(p => p.id === parseInt(projectId));
      
      if (foundProject) {
        setProject(foundProject);
        console.log('Found project:', foundProject);
      } else {
        setError('Project not found');
        return;
      }

      // Fetch project tasks
      console.log('Fetching tasks for project ID:', projectId);
      const tasksResponse = await dashboardService.getProjectTasks(parseInt(projectId));
      console.log('Tasks response:', tasksResponse);
      setTasks(tasksResponse.tasks || []);
    } catch (err) {
      console.error('Failed to fetch project data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    if (!project) return;
    
    try {
      setIsCreatingTask(true);
      const response = await dashboardService.createTask(project.id, taskData);
      
      // Add the new task to the list
      setTasks(prev => [response.task, ...prev]);
      
      // Close modal
      setIsCreateTaskModalOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task. Please try again.');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleTaskStatusChange = async (taskId: number, newStatus: string) => {
    try {
      // Update the task status locally first for immediate UI feedback
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      // Make the API call to update the task status
      await dashboardService.updateTaskStatus(taskId, newStatus);
      
      // Refresh the project data to get updated progress
      if (id) {
        const projectResponse = await dashboardService.getProjects();
        const updatedProject = projectResponse.projects.find(p => p.id === parseInt(id));
        if (updatedProject) {
          setProject(updatedProject);
        }
      }
      
      console.log(`Task ${taskId} status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update task status:', err);
      
      // Revert the change on error
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: task.status } : task
        )
      );
      
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTaskClick = (task: Task) => {
    // Handle task click - could open a detailed view modal
    console.log('Task clicked:', task);
    // You could implement a task detail modal here
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Project Tasks" customBreadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: 'Loading...', isCurrentPage: true }
        ]} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading tasks...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Project Tasks" customBreadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: 'Error', isCurrentPage: true }
        ]} />
        <div className="flex-1 flex items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Function to normalize status (same as KanbanBoard)
  const normalizeStatus = (status: string): string => {
    const normalized = status.toLowerCase().trim().replace(/\s+/g, '-');
    
    switch (normalized) {
      case 'to-do':
      case 'todo':
      case 'pending':
      case 'new':
        return 'pending';
      case 'in-progress':
      case 'in_progress':
      case 'inprogress':
      case 'active':
      case 'working':
        return 'in_progress';
      case 'in-review':
      case 'in_review':
      case 'review':
      case 'reviewing':
        return 'review';
      case 'done':
      case 'completed':
      case 'finished':
      case 'closed':
        return 'completed';
      default:
        return normalized;
    }
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => normalizeStatus(t.status) === 'completed').length,
    inProgress: tasks.filter(t => normalizeStatus(t.status) === 'in_progress').length,
    pending: tasks.filter(t => normalizeStatus(t.status) === 'pending').length,
    review: tasks.filter(t => normalizeStatus(t.status) === 'review').length,
  };

  // Debug: Log actual statuses and stats
  console.log('Task statuses from backend:', tasks.map(t => ({ id: t.id, status: t.status, normalized: normalizeStatus(t.status) })));
  console.log('Task stats calculation:', taskStats);
  console.log('Unique statuses:', [...new Set(tasks.map(t => t.status))]);

  // Create custom breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = project ? [
    { label: 'Projects', href: '/projects' },
    { label: project.name, href: `/projects/${id}` },
    { label: 'Tasks', isCurrentPage: true }
  ] : [
    { label: 'Projects', href: '/projects' },
    { label: 'Tasks', isCurrentPage: true }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title={`${project?.name || 'Project'} - Tasks`} customBreadcrumbs={breadcrumbs} />
      
      <main className="flex-1 overflow-auto px-6 py-6">
        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{taskStats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Review</p>
                  <p className="text-2xl font-bold text-orange-600">{taskStats.review}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="shadow-card mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="pending">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">In Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                {/* View Mode Switcher */}
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  <Button
                    variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                    className="rounded-none"
                  >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Kanban
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-none"
                  >
                    <List className="w-4 h-4 mr-2" />
                    List
                  </Button>
                </div>
              </div>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => setIsCreateTaskModalOpen(true)}
                disabled={isCreatingTask}
              >
                {isCreatingTask ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Tasks Views */}
        {filteredTasks.length > 0 ? (
          <>
            {viewMode === 'kanban' ? (
              <div className="min-h-[600px]">
                <KanbanBoard 
                  tasks={filteredTasks}
                  onTaskStatusChange={handleTaskStatusChange}
                  onTaskClick={handleTaskClick}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <Card key={task.id} className="shadow-card hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(task.status)}
                            <h4 className="font-semibold text-lg">{task.title}</h4>
                          </div>
                          <p className="text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                            </div>
                            {task.assignee && (
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {task.assignee.name?.split(' ').map(n => n[0]).join('') || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{task.assignee.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={getStatusColor(task.status)}
                          >
                            {formatStatus(task.status)}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  {tasks.length === 0 ? 'No tasks created yet' : 'No tasks match your filters'}
                </h3>
                <p className="text-sm mb-4">
                  {tasks.length === 0 
                    ? 'Create your first task to get started' 
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {tasks.length === 0 && (
                  <Button 
                    onClick={() => setIsCreateTaskModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Task
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        projectMembers={project?.members || []}
      />
    </div>
  );
}
