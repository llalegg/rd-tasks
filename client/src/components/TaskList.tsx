import { Task } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Edit, Trash2, Circle, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { DotsThreeVertical, PencilSimple, Trash } from "@phosphor-icons/react";
import MoreDotsIcon from "./MoreDotsIcon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import DeadlineBadge from "./DeadlineBadge";
import UserAvatar from "./UserAvatar";

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusUpdate?: (taskId: string, newStatus: Task['status']) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

type SortField = 'deadline' | 'type' | 'name' | 'assignee' | 'status';
type SortDirection = 'asc' | 'desc';

export default function TaskList({ tasks, onTaskClick, onStatusUpdate, onEditTask, onDeleteTask }: TaskListProps) {
  const [sortField, setSortField] = useState<SortField>('deadline');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Fetch users from API
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
  });

  // Fetch athletes from API
  const { data: athletes = [] } = useQuery({
    queryKey: ['/api/athletes'],
    queryFn: () => fetch('/api/athletes').then(res => res.json()),
  });

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
        const assigneeA = users.find((u: any) => u.id === a.assigneeId)?.name || '';
        const assigneeB = users.find((u: any) => u.id === b.assigneeId)?.name || '';
        aValue = assigneeA.toLowerCase();
        bValue = assigneeB.toLowerCase();
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
    <div className="w-full h-[calc(100vh-160px)]">
      <div className="h-full overflow-x-auto overflow-y-auto min-w-[800px]">
        <Table className="w-full table-fixed">
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow className="border-b border-border">
                <TableHead className="min-w-[240px] overflow-hidden text-ellipsis text-[#BCBBB7] font-montserrat text-[12px] font-medium leading-[132%]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium hover:bg-accent hover:text-accent-foreground text-[12px]" 
                    onClick={() => handleSort('name')}
                  >
                    Name
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead className="w-1/6 overflow-hidden text-ellipsis text-[#BCBBB7] font-montserrat text-[12px] font-medium leading-[132%]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium hover:bg-accent hover:text-accent-foreground text-[12px]" 
                    onClick={() => handleSort('type')}
                  >
                    Type
                    {getSortIcon('type')}
                  </Button>
                </TableHead>
                <TableHead className="w-1/6 overflow-hidden text-ellipsis text-[#BCBBB7] font-montserrat text-[12px] font-medium leading-[132%]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium hover:bg-accent hover:text-accent-foreground text-[12px]" 
                    onClick={() => handleSort('deadline')}
                  >
                    Deadline
                    {getSortIcon('deadline')}
                  </Button>
                </TableHead>
                <TableHead className="w-24 overflow-hidden text-ellipsis text-[#BCBBB7] font-montserrat text-[12px] font-medium leading-[132%]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium hover:bg-accent hover:text-accent-foreground text-[12px]" 
                    onClick={() => handleSort('assignee')}
                  >
                    Assignee
                    {getSortIcon('assignee')}
                  </Button>
                </TableHead>
                <TableHead className="w-24 overflow-hidden text-ellipsis text-[#BCBBB7] font-montserrat text-[12px] font-medium leading-[132%]">Related Athletes</TableHead>
                <TableHead className="w-1/6 overflow-hidden text-ellipsis text-[#BCBBB7] font-montserrat text-[12px] font-medium leading-[132%]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium hover:bg-accent hover:text-accent-foreground text-[12px]" 
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {getSortIcon('status')}
                  </Button>
                </TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.map((task) => {
                const assignee = users.find((u: any) => u.id === task.assigneeId);
                const relatedAthletes = task.relatedAthleteIds ? 
                  task.relatedAthleteIds.map(id => {
                    const athlete = athletes.find((a: any) => a.id === id);
                    return athlete ? { id: athlete.id, name: athlete.name } : null;
                  }).filter(Boolean) : [];

                return (
                  <TableRow 
                    key={task.id} 
                    className="cursor-pointer h-[48px] bg-[#1C1C1B] hover:bg-[#2C2C2B] transition-colors border-b-2 border-[#0D0D0C]"
                    onClick={() => onTaskClick(task)}
                  >
                    <TableCell className="overflow-hidden text-ellipsis text-[#F7F6F2] font-montserrat text-[14px] font-medium leading-[146%] pl-2">
                      {task.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {formatTaskType(task.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DeadlineBadge deadline={task.deadline || undefined} className="text-xs" />
                    </TableCell>
                    <TableCell>
                      {assignee ? (
                        <div className="flex items-center">
                          <UserAvatar
                            userId={assignee.id}
                            name={assignee.name}
                            size="sm"
                          />
                        </div>
                      ) : (
                        <span className="text-[#979795] text-xs">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {relatedAthletes.length > 0 ? (
                          <>
                            {relatedAthletes.length === 1 ? (
                              <UserAvatar
                                key={relatedAthletes[0]?.id}
                                userId={relatedAthletes[0]?.id}
                                name={relatedAthletes[0]?.name}
                                size="sm"
                              />
                            ) : (
                              <>
                                <UserAvatar
                                  key={relatedAthletes[0]?.id}
                                  userId={relatedAthletes[0]?.id}
                                  name={relatedAthletes[0]?.name}
                                  size="sm"
                                />
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-white/20">
                                  +{relatedAthletes.length - 1}
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <span className="text-[#979795] text-xs">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={task.status}
                        onValueChange={(value) => onStatusUpdate?.(task.id, value as Task['status'])}
                      >
                        <SelectTrigger className="w-32 bg-[rgba(0,0,0,0.25)] border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#292928]">
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <span className="sr-only">Open menu</span>
                            <MoreDotsIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#292928]">
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
      </div>
    );
}
