import React from "react";
import { Task, User, Athlete } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, User as UserIcon, Target, Clock, AlertCircle, CheckCircle, X, FileText } from "lucide-react";
import DeadlineBadge from "./DeadlineBadge";
import UserAvatar from "./UserAvatar";

interface TaskViewModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (task: Task) => void;
}

export default function TaskViewModal({ task, isOpen, onClose, onEdit }: TaskViewModalProps) {
  if (!task) return null;

  // Fetch users for assignee and creator
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: isOpen
  });

  // Fetch athletes
  const { data: athletes = [] } = useQuery<Athlete[]>({
    queryKey: ['/api/athletes'],
    enabled: isOpen
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

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'new': return null;
      case 'in_progress': return Clock;
      case 'blocked': return AlertCircle;
      case 'completed': return CheckCircle;
      default: return null;
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'new': return 'To-Do';
      case 'in_progress': return 'In Progress';
      case 'blocked': return 'Blocked';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'new': return 'text-blue-500';
      case 'in_progress': return 'text-yellow-500';
      case 'blocked': return 'text-orange-500';
      case 'completed': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const statusIcon = getStatusIcon(task.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-8">
              <DialogTitle className="text-xl font-semibold mb-2">{task.name}</DialogTitle>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">
                  {formatTaskType(task.type)}
                </Badge>
                <div className="flex items-center gap-2">
                  {statusIcon && React.createElement(statusIcon, { className: `h-4 w-4 ${getStatusColor(task.status)}` })}
                  <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="h-8 px-3"
                >
                  Edit
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Content */}
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Description */}
            {task.description && (
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                  <FileText className="h-4 w-4" />
                  Description
                </div>
                <p className="text-foreground leading-relaxed">
                  {task.description}
                </p>
              </div>
            )}

            {/* Task Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assignee */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Assigned to
                </h4>
                <div className="flex items-center gap-2">
                  {assignee ? (
                    <>
                      <UserAvatar userId={assignee.id} name={assignee.name} size="sm" />
                      <span className="text-sm font-medium">{assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Deadline
                </h4>
                {task.deadline ? (
                  <DeadlineBadge deadline={task.deadline} />
                ) : (
                  <span className="text-sm text-muted-foreground">No deadline set</span>
                )}
              </div>

              {/* Creator */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Created by</h4>
                <div className="flex items-center gap-2">
                  {creator ? (
                    <>
                      <UserAvatar userId={creator.id} name={creator.name} size="sm" />
                      <div>
                        <span className="text-sm font-medium block">{creator.name}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(task.createdAt)}</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unknown</span>
                  )}
                </div>
              </div>

              {/* Task Type */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Task Type
                </h4>
                <Badge variant="outline" className="text-sm">
                  {formatTaskType(task.type)}
                </Badge>
              </div>
            </div>

            {/* Related Athletes */}
            {relatedAthletes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Related Athletes</h4>
                <div className="flex flex-wrap gap-2">
                  {relatedAthletes.map((athlete) => (
                    <Badge key={athlete.id} variant="outline" className="text-sm">
                      {athlete.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Activity History */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Activity</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span>Task created</span>
                  <span className="text-muted-foreground">{formatDate(task.createdAt)}</span>
                </div>
                {task.updatedAt && task.updatedAt !== task.createdAt && (
                  <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span>Last updated</span>
                    <span className="text-muted-foreground">{formatDate(task.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}