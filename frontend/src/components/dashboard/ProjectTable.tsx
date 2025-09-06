import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const projects = [
  {
    id: 1,
    name: "Nelsa web development", 
    manager: "Om prakash sao",
    dueDate: "May 25, 2023",
    status: "Completed",
    progress: 100,
  },
  {
    id: 2,
    name: "Datascale AI app",
    manager: "Nelisan mando", 
    dueDate: "Jun 20, 2023",
    status: "Delayed",
    progress: 35,
  },
  {
    id: 3,
    name: "Media channel branding",
    manager: "Tiruvelly priya",
    dueDate: "July 13, 2023", 
    status: "At risk",
    progress: 68,
  },
  {
    id: 4,
    name: "Cortex iOS app development",
    manager: "Matte hannery",
    dueDate: "Dec 20, 2023",
    status: "Completed", 
    progress: 100,
  },
  {
    id: 5,
    name: "Website builder development",
    manager: "Sukumar rao",
    dueDate: "Mar 15, 2024",
    status: "On going",
    progress: 50,
  },
];

const statusStyles = {
  "Completed": "bg-success text-success-foreground",
  "Delayed": "bg-warning text-warning-foreground", 
  "At risk": "bg-destructive text-destructive-foreground",
  "On going": "bg-info text-info-foreground",
};

export function ProjectTable() {
  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Project summary</CardTitle>
        <div className="flex gap-4">
          <Select defaultValue="project">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="project">Project</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="manager">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manager">Project manager</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="status">
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                <th className="pb-3">Name</th>
                <th className="pb-3">Project manager</th>
                <th className="pb-3">Due date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Progress</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {projects.map((project) => (
                <tr key={project.id} className="border-b last:border-0">
                  <td className="py-4 font-medium">{project.name}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {project.manager.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{project.manager}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">{project.dueDate}</td>
                  <td className="py-4">
                    <Badge 
                      variant="secondary"
                      className={statusStyles[project.status as keyof typeof statusStyles]}
                    >
                      {project.status}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <Progress value={project.progress} className="flex-1" />
                      <span className="text-sm font-medium w-8">{project.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}