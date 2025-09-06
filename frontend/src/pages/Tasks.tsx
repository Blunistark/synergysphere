import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const columns = [
  {
    title: "Backlog Tasks",
    count: 5,
    color: "bg-orange-500",
    tasks: [
      {
        id: "UID007",
        title: "Model Answer",
        tag: "Design",
        tagColor: "bg-purple-500",
        priority: 4,
        assignees: ["JD", "SM"],
      },
      {
        id: "UID003", 
        title: "Create calendar, chat and email app pages",
        tag: "Development",
        tagColor: "bg-pink-500",
        priority: 5,
        assignees: ["JD", "SM"],
      },
    ],
  },
  {
    title: "To Do Tasks", 
    count: 3,
    color: "bg-blue-500",
    tasks: [
      {
        id: "UID005",
        title: "Model Answer",
        tag: "To Do",
        tagColor: "bg-red-500",
        priority: 1,
        assignees: ["AB", "CD"],
      },
      {
        id: "UID006",
        title: "Add authentication pages", 
        tag: "To Do",
        tagColor: "bg-red-500",
        priority: null,
        assignees: ["EF"],
      },
    ],
  },
  {
    title: "In Process",
    count: 2, 
    color: "bg-purple-500",
    tasks: [
      {
        id: "UID002",
        title: "Model Answer",
        tag: "In Process", 
        tagColor: "bg-purple-500",
        priority: 1,
        assignees: ["GH", "IJ"],
      },
    ],
  },
  {
    title: "Done",
    count: 5,
    color: "bg-green-500", 
    tasks: [
      {
        id: "UID002",
        title: "Model Answer",
        tag: "Done",
        tagColor: "bg-green-500",
        priority: 1,
        assignees: ["KL", "MN"],
      },
      {
        id: "UID002",
        title: "Create calendar, chat and email app pages",
        tag: "Done", 
        tagColor: "bg-green-500",
        priority: null,
        assignees: ["OP"],
      },
    ],
  },
];

export default function Tasks() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Tasks" />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.title} className="space-y-4">
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{column.title}</h3>
                  <Badge variant="secondary" className={`${column.color} text-white`}>
                    {column.count}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {column.tasks.map((task, index) => (
                  <Card key={`${task.id}-${index}`} className="shadow-card hover:shadow-elevated transition-all duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-medium leading-relaxed">
                          {task.title}
                        </CardTitle>
                        {task.priority && (
                          <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">#{task.id}</span>
                        <Badge 
                          variant="secondary"
                          className={`${task.tagColor} text-white text-xs`}
                        >
                          {task.tag}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {task.assignees.map((assignee, i) => (
                          <Avatar key={i} className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {assignee}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {task.assignees.length > 0 && (
                          <span className="text-xs text-muted-foreground">+{task.assignees.length}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add Task Button */}
                <Button 
                  variant="ghost" 
                  className="w-full h-12 border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}