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
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-[500px] bg-background border-l border-border z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {getStatusLabel(task.status)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full">
          {/* Task Title */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-2">{task.name}</h1>
            <Badge variant="outline" className="mb-3">
              {formatTaskType(task.type)}
            </Badge>
            {task.description && (
              <p className="text-muted-foreground leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Status Actions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {['new', 'in_progress', 'pending', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={task.status === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => onStatusUpdate(task.id, status as Task['status'])}
                  className="capitalize"
                >
                  {getStatusLabel(status as Task['status'])}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Task Details */}
          <div className="space-y-6">
            {/* Assignee */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Assigned to
              </h3>
              <Card>
                <CardContent className="p-4">
                  {assignee ? (
                    <div className="flex items-center gap-3">
                      <UserAvatar userId={assignee.id} size="md" showTooltip={false} />
                      <div>
                        <p className="font-medium">{assignee.name}</p>
                        <p className="text-sm text-muted-foreground">{assignee.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No assignee</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Priority */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Priority
              </h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <PriorityIcon priority={task.priority} size="md" />
                    <span className="capitalize font-medium">{task.priority}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Deadline */}
            {task.deadline && (
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Deadline
                </h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{new Date(task.deadline).toLocaleDateString()}</p>
                        <DeadlineBadge deadline={task.deadline} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Related Athletes */}
            {relatedAthletes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Related Athletes
                </h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {relatedAthletes.map((athlete) => (
                        <div key={athlete.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {athlete.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium">{athlete.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Creator */}
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Created by
              </h3>
              <Card>
                <CardContent className="p-4">
                  {creator ? (
                    <div className="flex items-center gap-3">
                      <UserAvatar userId={creator.id} size="md" showTooltip={false} />
                      <div>
                        <p className="font-medium">{creator.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Unknown creator</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}