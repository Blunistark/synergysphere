import { useParams } from "react-router-dom";
import { ProjectDashboard } from "@/components/dashboard/ProjectDashboard";
import { Header } from "@/components/layout/Header";

export default function ProjectDashboardPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Project Dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Project ID not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Project Dashboard" />
      <div className="flex-1 overflow-auto">
        <ProjectDashboard projectId={id} />
      </div>
    </div>
  );
}
