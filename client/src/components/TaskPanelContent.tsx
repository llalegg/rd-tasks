import { Task, User, Athlete } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, User as UserIcon, Calendar, Clock, FileText, Circle, AlertCircle, CheckCircle } from "lucide-react";
import DeadlineBadge from "./DeadlineBadge";
import UserAvatar from "./UserAvatar";
import PriorityIcon from "./PriorityIcon";

interface TaskPanelContentProps {
  task: Task;
  onStatusUpdate: (taskId: string, newStatus: Task['status']) => void;
}

export default function TaskPanelContent({ task, onStatusUpdate }: TaskPanelContentProps) {
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

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'new': return 'New';
      case 'in_progress': return 'In Progress';
      case 'blocked': return 'Blocked';
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

  return (
    <div className="space-y-4">
      {/* Task Title */}
      <div className="mb-4">
        <h1 className="text-base font-semibold mb-1">{task.name}</h1>
        <Badge variant="outline" className="mb-2 text-xs">
          {formatTaskType(task.type)}
        </Badge>
        {task.description && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Status Actions */}
      <div className="mb-4">
        <h3 className="text-xs font-medium mb-2 flex items-center gap-2 text-muted-foreground">
          <Target className="h-3 w-3" />
          Status
        </h3>
        <Select 
          value={task.status} 
          onValueChange={(value) => onStatusUpdate(task.id, value as Task['status'])}
        >
          <SelectTrigger className="w-full h-8">
            <div className="flex items-center gap-2">
              {(() => {
                const StatusIcon = getStatusIcon(task.status);
                return <StatusIcon className="h-3 w-3" />;
              })()}
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {['new', 'in_progress', 'blocked', 'completed'].map((status) => {
              const StatusIcon = getStatusIcon(status as Task['status']);
              return (
                <SelectItem key={status} value={status}>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-3 w-3" />
                    {getStatusLabel(status as Task['status'])}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      {/* Task Details */}
      <div className="space-y-4">
        {/* Assignee */}
        <div>
          <h3 className="text-xs font-medium mb-2 flex items-center gap-2 text-muted-foreground">
            <UserIcon className="h-3 w-3" />
            Assigned to
          </h3>
          <div className="bg-muted/30 p-3 rounded-md">
            {assignee ? (
              <div className="flex items-center gap-2">
                <UserAvatar userId={assignee.id} size="sm" showTooltip={false} />
                <div>
                  <p className="font-medium text-sm">{assignee.name}</p>
                  <p className="text-xs text-muted-foreground">{assignee.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No assignee</p>
            )}
          </div>
        </div>

        {/* Priority */}
        <div>
          <h3 className="text-xs font-medium mb-2 flex items-center gap-2 text-muted-foreground">
            <Target className="h-3 w-3" />
            Priority
          </h3>
          <div className="bg-muted/30 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <PriorityIcon priority={task.priority} size="sm" />
              <span className="capitalize font-medium text-sm">{task.priority}</span>
            </div>
          </div>
        </div>

        {/* Deadline */}
        {task.deadline && (
          <div>
            <h3 className="text-xs font-medium mb-2 flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Deadline
            </h3>
            <div className="bg-muted/30 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{new Date(task.deadline).toLocaleDateString()}</p>
                  <DeadlineBadge deadline={task.deadline} className="mt-1" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Related Athletes */}
        {relatedAthletes.length > 0 && (
          <div>
            <h3 className="text-xs font-medium mb-2 flex items-center gap-2 text-muted-foreground">
              <UserIcon className="h-3 w-3" />
              Related Athletes
            </h3>
            <div className="bg-muted/30 p-3 rounded-md">
              <div className="space-y-2">
                {relatedAthletes.map((athlete) => (
                  <div key={athlete.id} className="flex items-center gap-2">
                    <UserAvatar userId={athlete.id} size="sm" showTooltip={false} />
                    <span className="font-medium text-sm">{athlete.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Creator */}
        <div>
          <h3 className="text-xs font-medium mb-2 flex items-center gap-2 text-muted-foreground">
            <FileText className="h-3 w-3" />
            Created by
          </h3>
          <div className="bg-muted/30 p-3 rounded-md">
            {creator ? (
              <div className="flex items-center gap-2">
                <UserAvatar userId={creator.id} size="sm" showTooltip={false} />
                <div>
                  <p className="font-medium text-sm">{creator.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Unknown creator</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}