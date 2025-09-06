import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tasks = [
  {
    id: 1,
    title: "Create a user flow of social application design",
    status: "Approved",
    type: "approved"
  },
  {
    id: 2, 
    title: "Create a user flow of social application design",
    status: "In review",
    type: "review"
  },
  {
    id: 3,
    title: "Landing page design for Fintech project of singapore",
    status: "In review", 
    type: "review"
  },
  {
    id: 4,
    title: "Interactive prototype for app screens of deltamine project",
    status: "On going",
    type: "ongoing"
  },
  {
    id: 5,
    title: "Interactive prototype for app screens of deltamine project", 
    status: "Approved",
    type: "approved"
  },
];

const statusStyles = {
  approved: "bg-success text-success-foreground",
  review: "bg-destructive text-destructive-foreground",
  ongoing: "bg-info text-info-foreground",
};

export function TaskList() {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Today task</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">
              All
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                10
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="important" className="text-xs">Important</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">
              Notes
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                05
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="links" className="text-xs">
              Links
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                10
              </Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-3 mt-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted/50">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-relaxed">{task.title}</p>
                </div>
                <Badge 
                  variant="secondary"
                  className={statusStyles[task.type as keyof typeof statusStyles]}
                >
                  {task.status}
                </Badge>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}