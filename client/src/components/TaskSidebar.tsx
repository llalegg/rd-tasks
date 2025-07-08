import { useEffect } from "react";
import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit, Calendar, User, Target, Clock, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import UserAvatar from "./UserAvatar";
import PriorityIcon from "./PriorityIcon";
import DeadlineBadge from "./DeadlineBadge";
import { mockUsers, mockAthletes } from "@/data/mockData";

interface TaskSidebarProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (taskId: string, newStatus: Task['status']) => void;
  onEdit: (task: Task) => void;
}

export default function TaskSidebar({ task, isOpen, onClose, onStatusUpdate, onEdit }: TaskSidebarProps) {
  // Handle ESC key to close sidebar
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  if (!task) return null;

  const assignee = mockUsers.find(u => u.id === task.assigneeId);
  const creator = mockUsers.find(u => u.id === task.creatorId);
  const relatedAthletes = task.relatedAthleteIds ? 
    task.relatedAthleteIds.map(id => {
      const athlete = mockAthletes.find(a => a.id === id);
      return athlete ? { id: athlete.id, name: athlete.name } : null;
    }).filter(Boolean) : [];

  const formatTaskType = (type: string) => {
    return type.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'pending': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'new': return 'New';
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <>
      {/* Backdrop - removed to allow interaction with main content */}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-[500px] bg-background border-l border-border z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {getStatusLabel(task.status)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-7 w-7 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
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
            <div className="flex flex-wrap gap-1">
              {['new', 'in_progress', 'pending', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={task.status === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => onStatusUpdate(task.id, status as Task['status'])}
                  className="capitalize text-xs h-7"
                >
                  {getStatusLabel(status as Task['status'])}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Task Details */}
          <div className="space-y-4">
            {/* Assignee */}
            <div>
              <h3 className="text-xs font-medium mb-2 flex items-center gap-2 text-muted-foreground">
                <User className="h-3 w-3" />
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
                  <User className="h-3 w-3" />
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
      </div>
    </>
  );
}