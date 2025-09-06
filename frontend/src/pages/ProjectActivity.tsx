import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity,
  Plus,
  CheckCircle,
  UserPlus,
  FileText,
  MessageSquare,
  Calendar,
  Clock,
  Users,
  Settings,
  AlertCircle
} from "lucide-react";
import { dashboardService, Project } from "@/lib/dashboardService";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_completed' | 'member_added' | 'project_updated' | 'comment_added';
  title: string;
  description: string;
  user: {
    name: string;
    email: string;
  };
  timestamp: Date;
  metadata?: any;
}

export default function ProjectActivity() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState("all");

  useEffect(() => {
    if (id) {
      fetchProjectAndActivity(id);
    }
  }, [id]);

  const fetchProjectAndActivity = async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await dashboardService.getProjects();
      const foundProject = response.projects.find(p => p.id === parseInt(projectId));
      
      if (foundProject) {
        setProject(foundProject);
        // Generate mock activity data since API doesn't provide this yet
        generateMockActivities(foundProject);
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

  const generateMockActivities = (project: Project) => {
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'project_updated',
        title: 'Project Created',
        description: `${project.creator?.name || 'Someone'} created the project`,
        user: project.creator || { name: 'Unknown', email: '' },
        timestamp: new Date(project.createdAt),
      },
      {
        id: '2',
        type: 'member_added',
        title: 'Team Members Added',
        description: `${project.members?.length || 0} team members were added to the project`,
        user: project.creator || { name: 'Unknown', email: '' },
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: '3',
        type: 'task_created',
        title: 'Tasks Created',
        description: `${project.taskProgress?.total || 0} tasks were created for the project`,
        user: project.creator || { name: 'Unknown', email: '' },
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        id: '4',
        type: 'task_completed',
        title: 'Tasks Completed',
        description: `${project.taskProgress?.completed || 0} tasks have been completed`,
        user: project.creator || { name: 'Unknown', email: '' },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
    ];

    // Add more activities if there are recent tasks
    if (project.taskProgress?.completed && project.taskProgress.completed > 0) {
      mockActivities.push({
        id: '5',
        type: 'comment_added',
        title: 'Recent Discussion',
        description: 'Team members have been actively discussing project progress',
        user: project.creator || { name: 'Unknown', email: '' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      });
    }

    setActivities(mockActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return <Plus className="w-4 h-4 text-blue-500" />;
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'member_added':
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      case 'project_updated':
        return <Settings className="w-4 h-4 text-orange-500" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_created':
        return 'bg-blue-100 text-blue-800';
      case 'task_completed':
        return 'bg-green-100 text-green-800';
      case 'member_added':
        return 'bg-purple-100 text-purple-800';
      case 'project_updated':
        return 'bg-orange-100 text-orange-800';
      case 'comment_added':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActivityType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const filteredActivities = activities.filter(activity => {
    if (activityFilter === "all") return true;
    return activity.type === activityFilter;
  });

  const activityStats = {
    total: activities.length,
    tasksCreated: activities.filter(a => a.type === 'task_created').length,
    tasksCompleted: activities.filter(a => a.type === 'task_completed').length,
    membersAdded: activities.filter(a => a.type === 'member_added').length,
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Project Activity" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading activity...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Project Activity" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title={`${project?.name} - Activity`} />
      
      <main className="flex-1 overflow-auto px-6 py-6">
        {/* Activity Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{activityStats.total}</p>
                </div>
                <Activity className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasks Created</p>
                  <p className="text-2xl font-bold text-blue-600">{activityStats.tasksCreated}</p>
                </div>
                <Plus className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                  <p className="text-2xl font-bold text-green-600">{activityStats.tasksCompleted}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Members Added</p>
                  <p className="text-2xl font-bold text-purple-600">{activityStats.membersAdded}</p>
                </div>
                <UserPlus className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Filter */}
        <Card className="shadow-card mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Track all project events and updates</CardDescription>
              </div>
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activity</SelectItem>
                  <SelectItem value="task_created">Tasks Created</SelectItem>
                  <SelectItem value="task_completed">Tasks Completed</SelectItem>
                  <SelectItem value="member_added">Members Added</SelectItem>
                  <SelectItem value="project_updated">Project Updates</SelectItem>
                  <SelectItem value="comment_added">Comments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {/* Activity Timeline */}
        {filteredActivities.length > 0 ? (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <Card key={activity.id} className="shadow-card hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-base">{activity.title}</h4>
                            <Badge className={getActivityColor(activity.type)}>
                              {formatActivityType(activity.type)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{activity.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {activity.user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span>{activity.user.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{getRelativeTime(activity.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  {activities.length === 0 ? 'No activity yet' : 'No activity matches your filter'}
                </h3>
                <p className="text-sm">
                  {activities.length === 0 
                    ? 'Project activity will appear here as team members work on tasks'
                    : 'Try selecting a different activity filter'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Summary */}
        <Card className="shadow-card mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Project Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Project Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(project?.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creator:</span>
                    <span>{project?.creator?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Progress:</span>
                    <span>{project?.taskProgress?.percentage || 0}% Complete</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Team & Tasks</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Team Members:</span>
                    <span>{project?.members?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Tasks:</span>
                    <span>{project?.taskProgress?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed Tasks:</span>
                    <span>{project?.taskProgress?.completed || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
