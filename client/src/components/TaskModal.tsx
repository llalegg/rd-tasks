import { Task } from "@shared/schema";
import { mockUsers, mockAthletes } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    task.relatedAthleteIds.map(id => mockAthletes.find(a => a.id === id)?.name).filter(Boolean) : 
    [];

  const formatTaskType = (type: string) => {
    return type.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

  const getPriorityVariant = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
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
                <Badge variant={getPriorityVariant(task.priority)}>
                  {task.priority.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Assignee</Label>
              <p className="text-foreground mt-1">{assignee?.name || 'Unassigned'}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
              <p className="text-foreground mt-1">{creator?.name || 'Unknown'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Deadline</Label>
              <p className="text-foreground mt-1">
                {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline set'}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Related Athletes</Label>
              <p className="text-foreground mt-1">
                {relatedAthletes.length > 0 ? relatedAthletes.join(', ') : 'None'}
              </p>
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
