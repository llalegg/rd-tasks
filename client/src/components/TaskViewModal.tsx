import React, { useState, useEffect } from "react";
import { Task } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCoaches, getAthletes, getPerson } from "@/data/prototypeData";

interface TaskViewModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (taskId: string, newStatus: Task['status']) => void;
  onDeleteTask?: (taskId: string) => void;
}

export default function TaskViewModal({ task, isOpen, onClose, onStatusUpdate, onDeleteTask }: TaskViewModalProps) {
  const [localTask, setLocalTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Use prototype data
  const users = getCoaches();
  const athletes = getAthletes();

  useEffect(() => {
    setLocalTask(task);
    setIsEditing(task?.id?.startsWith('task_') && task?.name === 'New Task');
  }, [task]);

  if (!localTask) return null;

  const assignee = getPerson(localTask.assigneeId || '');
  const relatedAthletes = localTask.relatedAthleteIds?.map(id => getPerson(id)).filter(Boolean) || [];

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Success",
      description: "Task updated successfully"
    });
  };

  const handleStatusChange = (newStatus: Task['status']) => {
    if (onStatusUpdate) {
      onStatusUpdate(localTask.id, newStatus);
    }
  };

  const handleDelete = () => {
    if (onDeleteTask) {
      onDeleteTask(localTask.id);
      onClose();
    }
  };

  const Content = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={localTask.name}
              onChange={(e) => setLocalTask(prev => prev ? {...prev, name: e.target.value} : null)}
              className="text-lg font-semibold"
              placeholder="Task name"
            />
          ) : (
            <h2 className="text-lg font-semibold text-gray-900 break-words">
              {localTask.name}
            </h2>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="ml-2 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Status and Priority */}
      <div className="flex gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">STATUS</label>
          <Select value={localTask.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-32">
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
        
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">PRIORITY</label>
          <Select 
            value={localTask.priority} 
            onValueChange={(value) => setLocalTask(prev => prev ? {...prev, priority: value} : null)}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500">DESCRIPTION</label>
        {isEditing ? (
          <Textarea
            value={localTask.description}
            onChange={(e) => setLocalTask(prev => prev ? {...prev, description: e.target.value} : null)}
            placeholder="Task description"
            rows={3}
          />
        ) : (
          <p className="text-sm text-gray-600">{localTask.description}</p>
        )}
      </div>

      {/* Assignee */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500">ASSIGNEE</label>
        <Select 
          value={localTask.assigneeId || ''} 
          onValueChange={(value) => setLocalTask(prev => prev ? {...prev, assigneeId: value} : null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select assignee" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} ({user.position})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Related Athletes */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500">RELATED ATHLETES</label>
        <div className="flex flex-wrap gap-2">
          {relatedAthletes.map((athlete) => (
            <Badge key={athlete.id} variant="outline" className="text-xs">
              {athlete.name}
            </Badge>
          ))}
          {relatedAthletes.length === 0 && (
            <span className="text-sm text-gray-400">No athletes assigned</span>
          )}
        </div>
      </div>

      {/* Deadline */}
      {localTask.deadline && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500">DEADLINE</label>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            {new Date(localTask.deadline).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        {isEditing ? (
          <>
            <Button onClick={handleSave} size="sm">
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setIsEditing(true)} size="sm">
              Edit Task
            </Button>
            <Button variant="destructive" onClick={handleDelete} size="sm">
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>Task Details</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <Content />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">Task Details</DialogTitle>
        <Content />
      </DialogContent>
    </Dialog>
  );
}
