import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Users,
  BarChart3,
  Calendar,
  Target,
  TrendingUp,
  Activity
} from "lucide-react";
import { dashboardService, Project, Task } from "@/lib/dashboardService";

interface ProjectDashboardProps {
  projectId: string;
}

export function ProjectDashboard({ projectId }: ProjectDashboardProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch project details
      const projectsResponse = await dashboardService.getProjects();
      const foundProject = projectsResponse.projects.find(p => p.id === parseInt(projectId));
      
      if (foundProject) {
        setProject(foundProject);
        
        // Fetch project tasks
        const tasksResponse = await dashboardService.getProjectTasks(parseInt(projectId));
        setTasks(tasksResponse.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch project data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskStatusCounts = () => {
    const counts = {
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending' || t.status === 'todo').length,
      overdue: tasks.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        const today = new Date();
        return dueDate < today && t.status !== 'completed';
      }).length
    };
    return counts;
  };

  const getTeamProgress = () => {
    if (!project?.members || tasks.length === 0) return [];
    
    return project.members.map(member => {
      const memberTasks = tasks.filter(t => t.assignee?.id === member.user?.id);
      const completedTasks = memberTasks.filter(t => t.status === 'completed').length;
      const totalTasks = memberTasks.length;
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      return {
        ...member,
        totalTasks,
        completedTasks,
        progress: Math.round(progress)
      };
    });
  };

  const getProjectMetrics = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const currentWeekTasks = tasks.filter(t => {
      const taskDate = new Date(t.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return taskDate >= weekAgo;
    }).length;
    
    return {
      totalTasks,
      completedTasks,
      overallProgress: Math.round(overallProgress),
      currentWeekTasks,
      teamSize: project?.members?.length || 0
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Project not found</p>
        </div>
      </div>
    );
  }

  const taskCounts = getTaskStatusCounts();
  const teamProgress = getTeamProgress();
  const metrics = getProjectMetrics();

  return (
    <div className="p-6 space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name} Dashboard</h1>
          <p className="text-muted-foreground mt-1">Project analytics and team progress</p>
        </div>
        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          {metrics.overallProgress}% Complete
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.currentWeekTasks} added this week
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{taskCounts.completed}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.overallProgress}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{taskCounts.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              {taskCounts.overdue} overdue tasks
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Team Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.teamSize}</div>
            <p className="text-xs text-muted-foreground">
              Active members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Project Progress
          </CardTitle>
          <CardDescription>
            Overall completion status for {project.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completed Tasks</span>
              <span>{taskCounts.completed} of {metrics.totalTasks}</span>
            </div>
            <Progress value={metrics.overallProgress} className="h-3" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl font-bold text-green-600">{taskCounts.completed}</div>
              <div className="text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{taskCounts.inProgress}</div>
              <div className="text-muted-foreground">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{taskCounts.pending}</div>
              <div className="text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Progress */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Team Progress
          </CardTitle>
          <CardDescription>
            Individual team member performance and task completion
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamProgress.length > 0 ? (
            <div className="space-y-4">
              {teamProgress.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {member.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.completedTasks} of {member.totalTasks} tasks completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right min-w-[100px]">
                      <Progress value={member.progress} className="h-2 w-20" />
                      <p className="text-sm text-muted-foreground mt-1">{member.progress}%</p>
                    </div>
                    <Badge variant="secondary">{member.role}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No team members assigned</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Tasks
          </CardTitle>
          <CardDescription>
            Latest task updates and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.assignee ? `Assigned to ${task.assignee.name}` : 'Unassigned'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={task.status === 'completed' ? 'default' : 'secondary'}
                      className={task.status === 'completed' ? 'bg-green-500' : ''}
                    >
                      {task.status === 'in_progress' ? 'In Progress' : 
                       task.status === 'completed' ? 'Completed' : 
                       task.status}
                    </Badge>
                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tasks yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
