import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { EditProjectModal } from "@/components/modals/EditProjectModal";
import { 
  Plus, 
  Loader2, 
  AlertCircle, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Calendar, 
  CheckSquare,
  Users,
  Clock
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { dashboardService, Project } from "@/lib/dashboardService";

export default function Projects() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [projectTags, setProjectTags] = useState<Record<number, string[]>>({});
  const [projectDeadlines, setProjectDeadlines] = useState<Record<number, Date>>({});

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Initialize tags and deadlines when projects are loaded
  useEffect(() => {
    if (projects.length > 0) {
      const initialTags: Record<number, string[]> = {};
      const initialDeadlines: Record<number, Date> = {};
      
      projects.forEach(project => {
        // Generate consistent tags and deadlines if not already set
        if (!projectTags[project.id]) {
          initialTags[project.id] = getRandomTags(project.id);
        }
        if (!projectDeadlines[project.id]) {
          initialDeadlines[project.id] = getRandomDeadline(project.id);
        }
      });
      
      setProjectTags(prev => ({ ...prev, ...initialTags }));
      setProjectDeadlines(prev => ({ ...prev, ...initialDeadlines }));
    }
  }, [projects]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await dashboardService.getProjects();
      setProjects(response.projects);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      setIsCreating(true);
      const response = await dashboardService.createProject(projectData);
      
      // Add the new project to the list
      setProjects(prev => [response.project, ...prev]);
      
      // Show success message (you could add a toast here)
      console.log("Project created successfully:", response.project);
      
      // Close modal
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create project:', err);
      // You could show an error toast here
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (projectData: any) => {
    if (!editingProject) return;
    
    try {
      setIsUpdating(true);
      const response = await dashboardService.updateProject(editingProject.id, projectData);
      
      // Update the project in the list
      setProjects(prev => prev.map(p => 
        p.id === editingProject.id ? { ...p, ...response.project } : p
      ));
      
      // Update tags and deadline in local state
      if (projectData.tags) {
        setProjectTags(prev => ({
          ...prev,
          [editingProject.id]: projectData.tags
        }));
      }
      
      if (projectData.deadline) {
        setProjectDeadlines(prev => ({
          ...prev,
          [editingProject.id]: new Date(projectData.deadline)
        }));
      }
      
      // Close modal
      setIsEditModalOpen(false);
      setEditingProject(null);
      
      console.log("Project updated successfully:", response.project);
    } catch (err: any) {
      console.error('Failed to update project:', err);
      const errorMessage = err.message || 'Failed to update project. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    const projectName = project?.name || 'this project';
    
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone and will remove all associated tasks and data.`)) {
      try {
        await dashboardService.deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
        console.log("Project deleted successfully:", projectId);
      } catch (err) {
        console.error('Failed to delete project:', err);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const getRandomTags = (projectId: number) => {
    // Generate consistent tags based on project ID
    const allTags = ['Frontend', 'Backend', 'Mobile', 'Web', 'API', 'Database', 'Design', 'Testing', 'DevOps'];
    const numTags = (projectId % 3) + 1; // 1-3 tags per project
    const startIndex = projectId % (allTags.length - numTags);
    return allTags.slice(startIndex, startIndex + numTags);
  };

  const getRandomDeadline = (projectId: number) => {
    // Generate a consistent deadline based on project ID
    const daysFromNow = ((projectId * 7) % 60) + 7; // 7-67 days from now
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + daysFromNow);
    return deadline;
  };

  const isDeadlineNear = (deadline: Date) => {
    const today = new Date();
    const timeDiff = deadline.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 7; // Consider deadline near if within 7 days
  };

  const formatDeadline = (deadline: Date) => {
    const today = new Date();
    const timeDiff = deadline.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return 'Overdue';
    if (daysDiff === 0) return 'Due today';
    if (daysDiff === 1) return 'Due tomorrow';
    if (daysDiff <= 7) return `Due in ${daysDiff} days`;
    return deadline.toLocaleDateString();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Projects" />
      
      {/* Create Project Button */}
      <div className="p-6 pb-2">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={isCreating}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create New Project
            </>
          )}
        </Button>
      </div>
      
      <main className="flex-1 overflow-auto px-6 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading projects...</span>
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">No projects found</p>
            <p className="text-sm text-muted-foreground mb-6">Create your first project to get started</p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const deadline = projectDeadlines[project.id] || getRandomDeadline(project.id);
              const tags = projectTags[project.id] || getRandomTags(project.id);
              const isNearDeadline = isDeadlineNear(deadline);
              
              return (
                <Card key={project.id} className="shadow-card hover:shadow-elevated transition-all duration-300 relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 pr-8">{project.name}</CardTitle>
                        <CardDescription className="text-sm leading-relaxed mb-3">
                          {project.summary || 'No description available'}
                        </CardDescription>
                        
                        {/* Project Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs px-2 py-1"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Three Dots Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditProject(project)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Project Stats */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <CheckSquare className="h-4 w-4" />
                          <span>Tasks</span>
                        </div>
                        <span className="font-medium">
                          {project.taskProgress?.completed || 0} / {project.taskProgress?.total || 0}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Team</span>
                        </div>
                        <span className="font-medium">{project.members?.length || 0} members</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Deadline</span>
                        </div>
                        <span className={`font-medium ${isNearDeadline ? 'text-red-600' : 'text-green-600'}`}>
                          {formatDeadline(deadline)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.taskProgress?.percentage || 0}%</span>
                      </div>
                      <ProgressBar percentage={project.taskProgress?.percentage || 0} />
                    </div>
                    
                    {/* Deadline Warning */}
                    {isNearDeadline && (
                      <div className="flex items-center gap-2 text-sm text-red-600 mb-3 p-2 bg-red-50 rounded-md">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Deadline approaching!</span>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                      size="sm"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      VIEW PROJECT
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
      
      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleUpdateProject}
        project={editingProject}
        isLoading={isUpdating}
      />
    </div>
  );
}