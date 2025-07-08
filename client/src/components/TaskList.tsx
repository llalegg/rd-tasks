import { Task } from "@shared/schema";
import { mockUsers, mockAthletes } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DeadlineBadge from "./DeadlineBadge";

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function TaskList({ tasks, onTaskClick }: TaskListProps) {
  const formatTaskType = (type: string) => {
    return type.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusVariant = (status: Task['status']) => {
    switch (status) {
      case 'new': return 'secondary';
      case 'in_progress': return 'default';
      case 'pending': return 'outline';
      case 'completed': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Deadline</TableHead>
                <TableHead className="min-w-[180px]">Type</TableHead>
                <TableHead className="min-w-[200px]">Name</TableHead>
                <TableHead className="min-w-[150px]">Assignee</TableHead>
                <TableHead className="min-w-[150px]">Related Athlete</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const assignee = mockUsers.find(u => u.id === task.assigneeId);
                const relatedAthletes = task.relatedAthleteIds ? 
                  task.relatedAthleteIds.map(id => mockAthletes.find(a => a.id === id)?.name).filter(Boolean).join(', ') : 
                  'None';

                return (
                  <TableRow 
                    key={task.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onTaskClick(task)}
                  >
                    <TableCell>
                      <DeadlineBadge deadline={task.deadline} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {formatTaskType(task.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {task.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {assignee?.name || 'Unassigned'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {relatedAthletes}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(task.status)}>
                        {formatStatus(task.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
