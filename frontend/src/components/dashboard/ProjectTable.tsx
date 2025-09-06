import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { dashboardService, Project } from "@/lib/dashboardService";

const statusStyles = {
  "Completed": "bg-green-100 text-green-800 border-green-200",
  "Delayed": "bg-red-100 text-red-800 border-red-200", 
  "At Risk": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "On Track": "bg-blue-100 text-blue-800 border-blue-200",
  "Not Started": "bg-gray-100 text-gray-800 border-gray-200",
};

const getProjectStatus = (project: Project): string => {
  if (project.taskProgress.percentage === 100) return 'Completed';
  if (project.taskProgress.percentage === 0) return 'Not Started';
  if (project.taskProgress.percentage < 50) return 'At Risk';
  return 'On Track';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function ProjectTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
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

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    if (statusFilter === "all") return true;
    return getProjectStatus(project) === statusFilter;
  });

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Project summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading projects...</span>
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
          <CardTitle>Project summary</CardTitle>
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Project summary</CardTitle>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="On Track">On Track</SelectItem>
              <SelectItem value="At Risk">At Risk</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {projects.length === 0 ? "No projects found" : "No projects match the selected filter"}
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Project Manager</th>
                  <th className="pb-3">Created</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Progress</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {filteredProjects.map((project) => {
                  const status = getProjectStatus(project);
                  const manager = project.creator; // Use creator as project manager
                  
                  return (
                    <tr key={project.id} className="border-b last:border-0">
                      <td className="py-4">
                        <div className="font-medium">{project.name}</div>
                        {project.summary && (
                          <div className="text-sm text-muted-foreground">{project.summary}</div>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt={manager.name} />
                            <AvatarFallback className="text-xs">
                              {getInitials(manager.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{manager.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {formatDate(project.createdAt)}
                      </td>
                      <td className="py-4">
                        <Badge className={statusStyles[status as keyof typeof statusStyles]}>
                          {status}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <Progress value={project.taskProgress.percentage} className="flex-1" />
                          <span className="text-sm font-medium w-8">
                            {project.taskProgress.percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}