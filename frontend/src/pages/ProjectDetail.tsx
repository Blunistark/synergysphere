import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import { BreadcrumbItem } from "@/hooks/useBreadcrumbs";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  MoreVertical,
  MessageSquare,
  FileText,
  Edit,
  Trash2,
  UserCheck,
  Clock4,
  UserPlus
} from "lucide-react";
import { dashboardService, Project, Task } from "@/lib/dashboardService";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  
  // Add Member modal state
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProjectDetail(id);
      fetchProjectTasks(id);
    }
  }, [id]);

  const fetchProjectDetail = async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For now, we'll get the project from the projects list
      // In a real app, you'd have a getProjectById API endpoint
      const response = await dashboardService.getProjects();
      const foundProject = response.projects.find(p => p.id === parseInt(projectId));
      
      if (foundProject) {
        setProject(foundProject);
      } else {
        setError('Project not found');
      }
    } catch (err) {
      console.error('Failed to fetch project:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectTasks = async (projectId: string) => {
    try {
      const response = await dashboardService.getProjectTasks(parseInt(projectId));
      setTasks(response.tasks);
    } catch (err) {
      console.error('Failed to fetch project tasks:', err);
      // Don't show error for tasks, just keep empty array
    }
  };

  const handleCreateTask = async (taskData: any) => {
    if (!project) return;
    
    try {
      setIsCreatingTask(true);
      const response = await dashboardService.createTask(project.id, taskData);
      
      // Add the new task to the list
      setTasks(prev => [response.task, ...prev]);
      
      // Refresh project data to update task progress
      await fetchProjectDetail(id!);
      
      // Show success message (you could add a toast here)
      console.log("Task created successfully:", response.task);
      
      // Close modal
      setIsCreateTaskModalOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
      // You could show an error toast here
      alert('Failed to create task. Please try again.');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      // Update task status in the local state immediately for better UX
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      // Make API call to update task status
      await dashboardService.updateTaskStatus(taskId, newStatus);
      
      // Refresh project data to update task progress
      await fetchProjectDetail(id!);
      
      console.log(`Task ${taskId} status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update task status:', err);
      // Revert the optimistic update
      await fetchProjectTasks(id!);
      alert('Failed to update task status. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      // Remove task from local state immediately
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // TODO: Add API call to delete task
      // await dashboardService.deleteTask(taskId);
      
      // Refresh project data to update task progress
      await fetchProjectDetail(id!);
      
      console.log(`Task ${taskId} deleted successfully`);
    } catch (err) {
      console.error('Failed to delete task:', err);
      // Refresh tasks to revert the optimistic update
      await fetchProjectTasks(id!);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleEditTask = (taskId: number) => {
    // TODO: Implement edit task functionality
    console.log(`Edit task ${taskId}`);
    alert('Edit task functionality coming soon!');
  };

  const handleAssignTask = (taskId: number) => {
    // TODO: Implement assign task functionality
    console.log(`Assign task ${taskId}`);
    alert('Assign task functionality coming soon!');
  };

  const handleAddMember = async () => {
    if (!newMemberEmail || !newMemberRole) {
      toast({
        title: "Missing Information",
        description: "Please fill in both email and role fields",
        variant: "destructive"
      });
      return;
    }

    setIsAddingMember(true);
    
    try {
      // Check if member already exists
      const memberExists = project?.members?.some(
        member => member.user.email.toLowerCase() === newMemberEmail.toLowerCase()
      );
      
      if (memberExists) {
        toast({
          title: "Member Already Exists",
          description: "This user is already a member of the project",
          variant: "destructive"
        });
        return;
      }
      
      // Create a new member object
      const newMember = {
        id: Date.now(), // Temporary ID
        user: {
          id: Date.now(),
          name: newMemberEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' '),
          email: newMemberEmail
        },
        role: newMemberRole,
        joined_at: new Date().toISOString()
      };

      // Add the new member to the project
      if (project) {
        const updatedProject = {
          ...project,
          members: [...(project.members || []), newMember]
        };
        setProject(updatedProject);
      }

      // Reset form and close modal
      setNewMemberEmail("");
      setNewMemberRole("");
      setIsAddMemberModalOpen(false);
      
      // Show success message
      toast({
        title: "Member Added Successfully",
        description: `${newMemberEmail} has been invited as ${newMemberRole}`,
      });
    } catch (err) {
      console.error('Failed to add member:', err);
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAddingMember(false);
    }
  };

  const getStatusBadgeColor = (percentage: number) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage === 0) return "bg-gray-500";
    if (percentage < 50) return "bg-red-500";
    return "bg-blue-500";
  };

  const getStatusText = (percentage: number) => {
    if (percentage === 100) return "Completed";
    if (percentage === 0) return "Not Started";
    if (percentage < 50) return "At Risk";
    return "In Progress";
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Project Details" customBreadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: 'Loading...', isCurrentPage: true }]} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading project...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Project Details" customBreadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: 'Error', isCurrentPage: true }]} />
        <div className="flex-1 flex items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Project not found'}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const completionPercentage = project.taskProgress?.percentage || 0;

  // Create custom breadcrumbs for this project
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Projects', href: '/projects' },
    { label: project.name, isCurrentPage: true }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Project Details" customBreadcrumbs={breadcrumbs} />
      
      {/* Back Button */}
      <div className="p-6 pb-2">
        <Button
          variant="ghost"
          onClick={() => navigate('/projects')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </div>

      <main className="flex-1 overflow-auto px-6 pb-6">
        {/* Project Header */}
        <Card className="mb-6 shadow-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{project.name}</CardTitle>
                <CardDescription className="text-base mb-4">
                  {project.summary || 'No description available'}
                </CardDescription>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {project.members?.length || 0} members
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  className={`${getStatusBadgeColor(completionPercentage)} text-white mb-2`}
                >
                  {getStatusText(completionPercentage)}
                </Badge>
                <div className="text-2xl font-bold">{completionPercentage}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{project.taskProgress?.completed || 0} of {project.taskProgress?.total || 0} tasks</span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
            </div>
          </CardHeader>
        </Card>

        {/* Project Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Completed Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {project.taskProgress?.completed || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tasks completed successfully
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {(project.taskProgress?.total || 0) - (project.taskProgress?.completed || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tasks currently in progress
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {project.members?.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Active team members
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Project Creator */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Project Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {project.creator?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{project.creator?.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{project.creator?.email || ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Project Tasks</h3>
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
            
            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id} className="shadow-card">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{task.title}</h4>
                          <p className="text-muted-foreground mb-3">{task.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                            </div>
                            {task.assignee && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                Assigned to: {task.assignee.name}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={task.status === 'completed' ? 'default' : 'secondary'}
                            className={task.status === 'completed' ? 'bg-green-500' : ''}
                          >
                            {task.status === 'in_progress' ? 'In Progress' : 
                             task.status === 'completed' ? 'Completed' : 
                             task.status === 'pending' ? 'Pending' :
                             task.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleEditTask(task.id)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Task
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAssignTask(task.id)}>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Reassign
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {task.status !== 'pending' && (
                                <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'pending')}>
                                  <Clock4 className="w-4 h-4 mr-2" />
                                  Mark as Pending
                                </DropdownMenuItem>
                              )}
                              {task.status !== 'in_progress' && (
                                <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}>
                                  <Clock className="w-4 h-4 mr-2" />
                                  Mark In Progress
                                </DropdownMenuItem>
                              )}
                              {task.status !== 'completed' && (
                                <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'completed')}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark Completed
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks created yet</p>
                    <p className="text-sm">Create your first task to get started</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Team Members</h3>
              <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                      Invite a new member to join this project.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => { e.preventDefault(); handleAddMember(); }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="email">Email</label>
                        <Input
                          id="email"
                          placeholder="Enter email address"
                          type="email"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          disabled={isAddingMember}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="role">Role</label>
                        <Select value={newMemberRole} onValueChange={setNewMemberRole} disabled={isAddingMember}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="developer">Developer</SelectItem>
                            <SelectItem value="designer">Designer</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddMemberModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isAddingMember || !newMemberEmail || !newMemberRole}
                      >
                        {isAddingMember ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          'Send Invitation'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="shadow-card">
              <CardContent className="pt-6">
                {project.members && project.members.length > 0 ? (
                  <div className="space-y-4">
                    {project.members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.user?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{member.user?.email || ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{member.role}</Badge>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No team members yet</p>
                    <p className="text-sm">Add team members to start collaborating</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Project activity will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
