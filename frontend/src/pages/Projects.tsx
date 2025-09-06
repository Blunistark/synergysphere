import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const projects = [
  {
    id: 1,
    title: "EcoFinds",
    description: "Sustainable e-commerce platform helping users discover eco-friendly alternatives to everyday products.",
  },
  {
    id: 2, 
    title: "Synergy Sphere",
    description: "Advanced team collaboration platform with task automation, real-time chat, and smart analytics.",
  },
  {
    id: 3,
    title: "Synaptica", 
    description: "Neuro-inspired AI research tool enabling rapid simulation, model training, and deployment for cognitive computing applications.",
  },
  {
    id: 4,
    title: "SurakshAI",
    description: "AI-powered cybersecurity system for detecting threats, preventing data breaches, and safeguarding enterprise infrastructure.",
  },
  {
    id: 5,
    title: "SwasthAI",
    description: "AI-powered healthcare management system for patient monitoring, appointment scheduling, and predictive diagnosis.",
  },
  {
    id: 6,
    title: "PulseNet",
    description: "Next-gen health monitoring network that connects wearable devices with hospitals for real-time vitals tracking and emergency alerts.",
  },
];

export default function Projects() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Projects" />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="shadow-card hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  size="sm"
                >
                  JOIN
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}