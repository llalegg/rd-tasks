import { Task } from "@shared/schema";
import { mockUsers, mockAthletes } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DeadlineBadge from "./DeadlineBadge";
import UserAvatar from "./UserAvatar";
import PriorityIcon from "./PriorityIcon";

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (taskId: string, newStatus: Task['status']) => void;
  onEdit: (task: Task) => void;
}

export default function TaskModal({ task, isOpen, onClose, onStatusUpdate, onEdit }: TaskModalProps) {
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



  const handleStatusChange = (newStatus: string) => {
    onStatusUpdate(task.id, newStatus as Task['status']);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>
            View and edit task information. You can update the task status using the dropdown below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Task Name</Label>
              <p className="text-foreground font-medium mt-1">{task.name}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <div className="mt-1">
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Description</Label>
            <p className="text-foreground mt-1">{task.description || 'No description provided'}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Type</Label>
              <p className="text-foreground mt-1">{formatTaskType(task.type)}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
              <div className="mt-1">
                <PriorityIcon priority={task.priority} size="md" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Assignee</Label>
              <div className="mt-1">
                {assignee ? (
                  <UserAvatar
                    userId={assignee.id}
                    name={assignee.name}
                    size="md"
                  />
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
              <div className="mt-1">
                {creator ? (
                  <UserAvatar
                    userId={creator.id}
                    name={creator.name}
                    size="md"
                  />
                ) : (
                  <span className="text-muted-foreground">Unknown</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Deadline</Label>
              <div className="mt-1">
                <DeadlineBadge deadline={task.deadline} />
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Related Athletes</Label>
              <div className="mt-1 flex items-center space-x-2">
                {relatedAthletes.length > 0 ? (
                  <div className="flex -space-x-1">
                    {relatedAthletes.map((athlete) => (
                      <UserAvatar
                        key={athlete!.id}
                        userId={athlete!.id}
                        name={athlete!.name}
                        size="md"
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Created</Label>
              <p className="text-foreground mt-1">{new Date(task.createdAt).toLocaleString()}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
              <p className="text-foreground mt-1">{new Date(task.updatedAt).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={() => onEdit(task)}
            >
              Edit Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
