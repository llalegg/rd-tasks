import { Task } from "@shared/schema";
import { mockUsers, mockAthletes } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Tag, User, Users } from "lucide-react";

interface TaskKanbanProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function TaskKanban({ tasks, onTaskClick }: TaskKanbanProps) {
  const columns = [
    { key: 'new', title: 'New', color: 'bg-slate-500' },
    { key: 'in_progress', title: 'In Progress', color: 'bg-blue-500' },
    { key: 'pending', title: 'Pending', color: 'bg-amber-500' },
    { key: 'completed', title: 'Completed', color: 'bg-emerald-500' }
  ];

  const formatTaskType = (type: string) => {
    return type.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

  const getPriorityVariant = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {columns.map((column) => {
        const columnTasks = tasks.filter(task => task.status === column.key);
        
        return (
          <Card key={column.key} className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  {column.title}
                </div>
                <Badge variant="outline" className="text-xs">
                  {columnTasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {columnTasks.map((task) => {
                const assignee = mockUsers.find(u => u.id === task.assigneeId);
                const relatedAthletes = task.relatedAthleteIds ? 
                  task.relatedAthleteIds.map(id => mockAthletes.find(a => a.id === id)?.name).filter(Boolean) : 
                  [];

                return (
                  <Card 
                    key={task.id} 
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                    onClick={() => onTaskClick(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-foreground line-clamp-2 flex-1">
                          {task.name}
                        </h4>
                        <Badge variant={getPriorityVariant(task.priority)} className="text-xs ml-2 flex-shrink-0">
                          {task.priority.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {task.description || 'No description'}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Tag className="w-3 h-3 mr-1" />
                          {formatTaskType(task.type)}
                        </div>
                        
                        <div className="flex items-center text-xs text-muted-foreground">
                          <User className="w-3 h-3 mr-1" />
                          {assignee?.name || 'Unassigned'}
                        </div>
                        
                        {task.deadline && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(task.deadline).toLocaleDateString()}
                          </div>
                        )}
                        
                        {relatedAthletes.length > 0 && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Users className="w-3 h-3 mr-1" />
                            {relatedAthletes.slice(0, 2).join(', ')}
                            {relatedAthletes.length > 2 && ` +${relatedAthletes.length - 2}`}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
