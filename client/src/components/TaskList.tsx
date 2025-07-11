import { Task } from "@shared/schema";
import { mockUsers, mockAthletes } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Edit, Trash2, Circle, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { DotsThreeVertical, PencilSimple, Trash } from "@phosphor-icons/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import DeadlineBadge from "./DeadlineBadge";
import UserAvatar from "./UserAvatar";
import PriorityIcon from "./PriorityIcon";

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusUpdate?: (taskId: string, newStatus: Task['status']) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

type SortField = 'deadline' | 'type' | 'name' | 'assignee' | 'priority' | 'status';
type SortDirection = 'asc' | 'desc';

export default function TaskList({ tasks, onTaskClick, onStatusUpdate, onEditTask, onDeleteTask }: TaskListProps) {
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
      case 'blocked': return 'outline';
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
          <Table className="w-full rounded-t-2xl">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center bg-[#1C1C1B] text-[12px] font-medium text-[#979795] hover:bg-transparent first:rounded-tl-2xl">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium" 
                    onClick={() => handleSort('priority')}
                  >
                    {getSortIcon('priority')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[200px] bg-[#1C1C1B] text-[12px] font-medium text-[#979795] hover:bg-transparent">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium" 
                    onClick={() => handleSort('name')}
                  >
                    Name
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[180px] bg-[#1C1C1B] text-[12px] font-medium text-[#979795] hover:bg-transparent">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium" 
                    onClick={() => handleSort('type')}
                  >
                    Type
                    {getSortIcon('type')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px] bg-[#1C1C1B] text-[12px] font-medium text-[#979795] hover:bg-transparent">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium" 
                    onClick={() => handleSort('deadline')}
                  >
                    Deadline
                    {getSortIcon('deadline')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[80px] bg-[#1C1C1B] text-[12px] font-medium text-[#979795] hover:bg-transparent">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium" 
                    onClick={() => handleSort('assignee')}
                  >
                    Assignee
                    {getSortIcon('assignee')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px] bg-[#1C1C1B] text-[12px] font-medium text-[#979795] hover:bg-transparent">Related Athletes</TableHead>
                <TableHead className="min-w-[120px] bg-[#1C1C1B] text-[12px] font-medium text-[#979795] hover:bg-transparent">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium" 
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {getSortIcon('status')}
                  </Button>
                </TableHead>
                <TableHead className="w-16 bg-[#1C1C1B] text-[12px] font-medium text-[#979795] hover:bg-transparent last:rounded-tr-2xl">Actions</TableHead>
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
                    className="cursor-pointer h-[48px] bg-[#1C1C1B] hover:bg-[#2C2C2B] transition-colors border-b-2 border-[#0D0D0C]"
                    onClick={() => onTaskClick(task)}
                  >
                    <TableCell className="text-center">
                      <PriorityIcon priority={task.priority} />
                    </TableCell>
                    <TableCell className="font-bold text-[#F7F6F2]">
                      {task.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs bg-transparent border-[#494947] text-[#979795] rounded-md">
                        {formatTaskType(task.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DeadlineBadge deadline={task.deadline} />
                    </TableCell>
                    <TableCell>
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            userId={assignee.id}
                            name={assignee.name}
                            size="sm"
                          />
                          <span className="text-sm text-[#979795]">{assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-[#979795] text-xs">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {relatedAthletes.map((athlete) => (
                          <Badge key={athlete.id} variant="outline" className="text-xs bg-transparent border-[#494947] text-[#979795] rounded-full">
                            {athlete.name}
                          </Badge>
                        ))}
                        {relatedAthletes.length === 0 && (
                          <span className="text-[#979795] text-xs">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={task.status}
                        onValueChange={(value) => onStatusUpdate?.(task.id, value as Task['status'])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <span className="sr-only">Open menu</span>
                            <DotsThreeVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onEditTask?.(task);
                          }}>
                            <PencilSimple className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask?.(task.id);
                          }}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
