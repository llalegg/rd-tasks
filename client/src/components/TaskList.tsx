import { Task } from "@shared/schema";
import { mockUsers, mockAthletes } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import DeadlineBadge from "./DeadlineBadge";
import UserAvatar from "./UserAvatar";
import PriorityIcon from "./PriorityIcon";

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

type SortField = 'deadline' | 'type' | 'name' | 'assignee' | 'priority' | 'status';
type SortDirection = 'asc' | 'desc';

export default function TaskList({ tasks, onTaskClick }: TaskListProps) {
  const [sortField, setSortField] = useState<SortField>('deadline');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4 ml-1" /> : 
      <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'deadline':
        aValue = a.deadline ? new Date(a.deadline).getTime() : 0;
        bValue = b.deadline ? new Date(b.deadline).getTime() : 0;
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'type':
        aValue = a.type.toLowerCase();
        bValue = b.type.toLowerCase();
        break;
      case 'assignee':
        const assigneeA = mockUsers.find(u => u.id === a.assigneeId)?.name || '';
        const assigneeB = mockUsers.find(u => u.id === b.assigneeId)?.name || '';
        aValue = assigneeA.toLowerCase();
        bValue = assigneeB.toLowerCase();
        break;
      case 'priority':
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
        break;
      case 'status':
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium" 
                    onClick={() => handleSort('type')}
                  >
                    Type
                    {getSortIcon('type')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[200px]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium" 
                    onClick={() => handleSort('name')}
                  >
                    Name
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium" 
                    onClick={() => handleSort('deadline')}
                  >
                    Deadline
                    {getSortIcon('deadline')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[80px]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium" 
                    onClick={() => handleSort('priority')}
                  >
                    Priority
                    {getSortIcon('priority')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[80px]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium" 
                    onClick={() => handleSort('assignee')}
                  >
                    Assignee
                    {getSortIcon('assignee')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px]">Related Athletes</TableHead>
                <TableHead className="min-w-[120px]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium" 
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {getSortIcon('status')}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.map((task) => {
                const assignee = mockUsers.find(u => u.id === task.assigneeId);
                const relatedAthletes = task.relatedAthleteIds ? 
                  task.relatedAthleteIds.map(id => {
                    const athlete = mockAthletes.find(a => a.id === id);
                    return athlete ? { id: athlete.id, name: athlete.name } : null;
                  }).filter(Boolean) : [];

                return (
                  <TableRow 
                    key={task.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onTaskClick(task)}
                  >
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {formatTaskType(task.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {task.name}
                    </TableCell>
                    <TableCell>
                      <DeadlineBadge deadline={task.deadline} />
                    </TableCell>
                    <TableCell>
                      <PriorityIcon priority={task.priority} />
                    </TableCell>
                    <TableCell>
                      {assignee ? (
                        <UserAvatar
                          userId={assignee.id}
                          name={assignee.name}
                          size="sm"
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-1">
                        {relatedAthletes.slice(0, 3).map((athlete, index) => (
                          <UserAvatar
                            key={athlete!.id}
                            userId={athlete!.id}
                            name={athlete!.name}
                            size="sm"
                          />
                        ))}
                        {relatedAthletes.length > 3 && (
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            +{relatedAthletes.length - 3}
                          </div>
                        )}
                        {relatedAthletes.length === 0 && (
                          <span className="text-muted-foreground text-xs">None</span>
                        )}
                      </div>
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
