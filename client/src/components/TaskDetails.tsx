import { Task, User, Athlete } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Target, User as UserIcon, Calendar, Clock, FileText, Circle, AlertCircle, CheckCircle, Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import DeadlineBadge from "./DeadlineBadge";
import UserAvatar from "./UserAvatar";
import PriorityIcon from "./PriorityIcon";
import { useToast } from "@/hooks/use-toast";

interface TaskDetailsProps {
  task: Task;
  onStatusUpdate: (taskId: string, newStatus: Task['status']) => void;
  onEdit?: (task: Task) => void;
  showEditButton?: boolean;
  layout?: 'sidebar' | 'modal';
}

export default function TaskDetails({ task, onStatusUpdate, onEdit, showEditButton = true, layout = 'sidebar' }: TaskDetailsProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Task['status'] | null>(null);
  const { toast } = useToast();

  // Fetch users for assignee and creator
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
  });

  // Fetch athletes
  const { data: athletes = [] } = useQuery<Athlete[]>({
    queryKey: ['/api/athletes'],
    queryFn: () => fetch('/api/athletes').then(res => res.json()),
  });

  const assignee = users.find(u => u.id === task.assigneeId);
  const creator = users.find(u => u.id === task.creatorId);
  const relatedAthletes = task.relatedAthleteIds 
    ? task.relatedAthleteIds.map(id => athletes.find(a => a.id === id)).filter(Boolean) as Athlete[]
    : [];

  const formatTaskType = (type: string) => {
    return type.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    const configs = {
      low: { color: 'bg-transparent backdrop-blur-sm text-secondary border-transparent', label: 'Low' },
      medium: { color: 'bg-[#302608] text-[#EAB308] border-transparent', label: 'Medium' },
      high: { color: 'bg-[#321A1A] text-[#F87171] border-transparent', label: 'High' }
    };
    return configs[priority] || configs.medium;
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'new': return 'To-Do';
      case 'in_progress': return 'In Progress';
      case 'blocked': return 'Pending';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'new': return Circle;
      case 'in_progress': return Clock;
      case 'blocked': return AlertCircle;
      case 'completed': return CheckCircle;
      default: return Circle;
    }
  };

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (newStatus === task.status) return;

    setIsUpdatingStatus(true);
    setSelectedStatus(newStatus);

    try {
      await onStatusUpdate(task.id, newStatus);
      toast({
        title: "Status updated",
        description: `Task status changed to ${getStatusLabel(newStatus)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
      setSelectedStatus(null);
    }
  };

  const titleSize = layout === 'modal' ? 'text-xl' : 'text-base';
  const spacing = layout === 'modal' ? 'space-y-2' : 'space-y-4';

  return (
    <div className={spacing}>
      {/* Task Title */}
      <div className="flex-1 min-w-0">
        <h1 className={`${titleSize} font-semibold mb-2 pr-4`}>{task.name}</h1>
        <Badge variant="outline" className="mb-2 text-xs">
          {formatTaskType(task.type)}
        </Badge>
        {showEditButton && onEdit && (
          <div className="mt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-8 px-3 text-xs"
            >
              Edit
            </Button>
          </div>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <div className="bg-muted/50 p-2 rounded-lg">
          <div className="mb-1">
            <span className="text-xs font-medium text-muted-foreground">Description</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {task.description}
          </p>
        </div>
      )}

      {/* Status Section */}
      <div className="bg-muted/50 p-2 rounded-lg">
        <div className="mb-1">
          <span className="text-xs font-medium text-muted-foreground">Status</span>
        </div>
        <Select 
          value={selectedStatus || task.status} 
          onValueChange={handleStatusChange}
          disabled={isUpdatingStatus}
        >
          <SelectTrigger className="w-full bg-black/25 border-transparent rounded-full">
            <SelectValue>
              <div className="flex items-center gap-2">
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  (() => {
                    const StatusIcon = getStatusIcon(selectedStatus || task.status);
                    return <StatusIcon className="h-4 w-4" />;
                  })()
                )}
                <span>{getStatusLabel(selectedStatus || task.status)}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-[#292928] border-none">
            <SelectItem value="new" className="hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4" />
                <span>To-Do</span>
              </div>
            </SelectItem>
            <SelectItem value="in_progress" className="hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>In Progress</span>
              </div>
            </SelectItem>
            <SelectItem value="blocked" className="hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>Pending</span>
              </div>
            </SelectItem>
            <SelectItem value="completed" className="hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Completed</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Priority and Deadline */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/50 p-2 rounded-lg">
          <div className="mb-1">
            <span className="text-xs font-medium text-muted-foreground">Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${getPriorityBadge(task.priority).color} text-xs font-medium w-fit`}
            >
              {getPriorityBadge(task.priority).label}
            </Badge>
          </div>
        </div>

        <div className="bg-muted/50 p-2 rounded-lg">
          <div className="mb-1">
            <span className="text-xs font-medium text-muted-foreground">Deadline</span>
          </div>
          {task.deadline ? (
            <div className="flex items-center gap-2">
              <DeadlineBadge deadline={task.deadline} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground cursor-help">
                      {formatDate(task.deadline)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Due: {formatDate(task.deadline)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No deadline set</span>
          )}
        </div>
      </div>

      {/* Assignee */}
      <div className="bg-muted/50 p-2 rounded-lg">
        <div className="mb-1">
          <span className="text-xs font-medium text-muted-foreground">Assignee</span>
        </div>
        {assignee ? (
          <div className="flex items-center gap-2">
            <UserAvatar userId={assignee.id} name={assignee.name} size="sm" />
            <span className="text-sm font-medium">{assignee.name === 'Christopher Harris' ? 'Christopher Harris (Me)' : assignee.name}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No assignee</span>
        )}
      </div>

      {/* Related Athletes */}
      {relatedAthletes.length > 0 && (
        <div className="bg-muted/50 p-2 rounded-lg">
          <div className="mb-1">
            <span className="text-xs font-medium text-muted-foreground">Related Athletes</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {relatedAthletes.map((athlete) => (
              <Badge key={athlete.id} variant="outline" className="text-xs">
                {athlete.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Creator */}
      <div className="bg-muted/50 p-2 rounded-lg">
        <div className="mb-1">
          <span className="text-xs font-medium text-muted-foreground">Created by</span>
        </div>
        {creator ? (
          <div className="flex items-center gap-2">
            <UserAvatar userId={creator.id} name={creator.name} size="sm" />
            <div>
              <span className="text-sm font-medium">{creator.name}</span>
              <p className="text-xs text-muted-foreground">
                {formatDate(task.createdAt)}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Unknown</span>
        )}
      </div>

      {/* Activity History */}
      <div className="bg-muted/50 p-2 rounded-lg">
        <div className="mb-1">
          <span className="text-xs font-medium text-muted-foreground">Activity History</span>
        </div>
        <div className="space-y-1">
          <div className="text-xs">
            <span className="text-muted-foreground">Task created by </span>
            <span className="font-medium">{creator?.name || 'Unknown'}</span>
            <span className="text-muted-foreground"> on {formatDate(task.createdAt)}</span>
          </div>
          {task.updatedAt && task.updatedAt !== task.createdAt && (
            <div className="text-xs">
              <span className="text-muted-foreground">Task updated on {formatDate(task.updatedAt)}</span>
            </div>
          )}
          {task.status === 'completed' && (
            <div className="text-xs">
              <span className="text-muted-foreground">Task completed on {formatDate(task.updatedAt || task.createdAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}