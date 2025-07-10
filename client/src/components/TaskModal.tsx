import { Task } from "@shared/schema";
import { mockUsers, mockAthletes } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, X, Check, Loader2, Calendar, User, Target, Clock, FileText, Circle, AlertCircle, CheckCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import DeadlineBadge from "./DeadlineBadge";
import UserAvatar from "./UserAvatar";
import PriorityIcon from "./PriorityIcon";
import { useToast } from "@/hooks/use-toast";

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (taskId: string, newStatus: Task['status']) => void;
  onEdit: (task: Task) => void;
}

export default function TaskModal({ task, isOpen, onClose, onStatusUpdate, onEdit }: TaskModalProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Task['status'] | null>(null);
  const { toast } = useToast();

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    const configs = {
      low: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Low' },
      medium: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Medium' },
      high: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'High' }
    };
    return configs[priority] || configs.medium;
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

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'new': return 'New';
      case 'in_progress': return 'In Progress';
      case 'blocked': return 'Blocked';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const handleStatusChange = async (newStatus: Task['status']) => {
    setIsUpdatingStatus(true);
    setSelectedStatus(newStatus);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      onStatusUpdate(task.id, newStatus);
      
      toast({
        title: "Status updated",
        description: `Task status changed to ${getStatusLabel(newStatus)}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsUpdatingStatus(false);
      setSelectedStatus(null);
    }
  };

  const priorityConfig = getPriorityBadge(task.priority);

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 glass-effect">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
            <DialogHeader className="flex-1">
              <DialogTitle className="text-xl font-semibold pr-8">{task.name}</DialogTitle>
              <Badge variant="outline" className="w-fit mt-2">
                {formatTaskType(task.type)}
              </Badge>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(task)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit task</TooltipContent>
              </Tooltip>
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

          {/* Scrollable Content */}
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="p-6 space-y-6">
              {/* Content Section */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Content
                </div>
                <div>
                  <p className="text-foreground leading-relaxed">
                    {task.description || 'No description provided'}
                  </p>
                </div>
              </div>

              {/* Status Controls Section */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Target className="h-4 w-4" />
                  Status
                </div>
                <div className="flex items-center gap-3">
                  <Select 
                    value={task.status} 
                    onValueChange={(value) => handleStatusChange(value as Task['status'])}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="w-48 h-10">
                      <div className="flex items-center gap-2">
                        {isUpdatingStatus ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          (() => {
                            const StatusIcon = getStatusIcon(task.status);
                            return <StatusIcon className="h-4 w-4" />;
                          })()
                        )}
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {['new', 'in_progress', 'blocked', 'completed'].map((status) => {
                        const StatusIcon = getStatusIcon(status as Task['status']);
                        return (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center gap-2">
                              <StatusIcon className="h-4 w-4" />
                              {getStatusLabel(status as Task['status'])}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {isUpdatingStatus && (
                    <Badge variant="secondary" className="text-xs">
                      Updating...
                    </Badge>
                  )}
                </div>
              </div>

              {/* Metadata Section */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  Task Information
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Assignee */}
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Assigned to
                    </Label>
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

                  {/* Creator */}
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Created by
                    </Label>
                    <div className="flex items-center gap-2">
                      {creator ? (
                        <>
                          <UserAvatar userId={creator.id} name={creator.name} size="sm" />
                          <div>
                            <span className="text-sm font-medium">{creator.name}</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs text-muted-foreground cursor-help">
                                  {formatDate(task.createdAt)}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                Created at {new Date(task.createdAt).toLocaleString()}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unknown</span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Priority & Deadline Group */}
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Priority & Urgency
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <PriorityIcon priority={task.priority} size="sm" />
                        <Badge className={`text-xs ${priorityConfig.color}`}>
                          {priorityConfig.label} Priority
                        </Badge>
                      </div>
                      {task.deadline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{formatDate(task.deadline)}</span>
                          <DeadlineBadge deadline={task.deadline} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Related Athletes */}
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Related Athletes
                    </Label>
                    <div className="flex items-center gap-2">
                      {relatedAthletes.length > 0 ? (
                        <div className="flex -space-x-1">
                          {relatedAthletes.slice(0, 3).map((athlete) => (
                            <UserAvatar
                              key={athlete.id}
                              userId={athlete.id}
                              name={athlete.name}
                              size="sm"
                            />
                          ))}
                          {relatedAthletes.length > 3 && (
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium text-muted-foreground border-2 border-background">
                              +{relatedAthletes.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Sticky Footer */}
          <div className="flex justify-end p-6 border-t border-border bg-background">
            <Button onClick={() => onEdit(task)} size="sm">
              Edit Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
