import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const workloadData = [
  { name: "Sam", tasks: 10, color: "bg-orange-500" },
  { name: "Meldy", tasks: 8, color: "bg-gray-400" }, 
  { name: "Ken", tasks: 2, color: "bg-gray-400" },
  { name: "Dmitry", tasks: 8, color: "bg-gray-400" },
  { name: "Vego", tasks: 8, color: "bg-gray-400" },
  { name: "Kashn", tasks: 2, color: "bg-gray-400" },
  { name: "Melm", tasks: 4, color: "bg-gray-400" },
];

export function WorkloadChart() {
  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projects Workload</CardTitle>
        <Select defaultValue="3months">
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {workloadData.map((person, index) => (
            <div key={person.name} className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium mb-1">{String(index + 7).padStart(2, '0')}</span>
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm">
                    {person.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs mt-1">{person.name}</span>
              </div>
              <div className="flex-1">
                <div className="flex gap-1">
                  {Array.from({ length: person.tasks }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-12 w-12 rounded-full ${person.color} flex items-center justify-center text-white text-xs font-medium`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}