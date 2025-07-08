import { useState, useEffect } from "react";
import { Task } from "@shared/schema";
import { mockUsers, mockAthletes, taskTypes } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";

interface TaskFormProps {
  task: Task | null;
  isOpen: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>) => void;
}

export default function TaskForm({ task, isOpen, mode, onClose, onSubmit }: TaskFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    priority: '',
    assigneeId: '',
    deadline: '',
    relatedAthleteIds: [] as string[]
  });

  useEffect(() => {
    if (mode === 'edit' && task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        type: task.type,
        priority: task.priority,
        assigneeId: task.assigneeId,
        deadline: task.deadline || '',
        relatedAthleteIds: task.relatedAthleteIds || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: '',
        priority: '',
        assigneeId: '',
        deadline: '',
        relatedAthleteIds: []
      });
    }
  }, [mode, task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAthleteSelection = (athleteId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        relatedAthleteIds: [...prev.relatedAthleteIds, athleteId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        relatedAthleteIds: prev.relatedAthleteIds.filter(id => id !== athleteId)
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Task' : 'Edit Task'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Fill in the details below to create a new task.' 
              : 'Update the task information below.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Priority *</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select priority..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Assignee *</Label>
              <Select 
                value={formData.assigneeId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, assigneeId: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select assignee..." />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deadline" className="text-sm font-medium">
                Deadline
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Related Athletes</Label>
            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
              {mockAthletes.map((athlete) => (
                <div key={athlete.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`athlete-${athlete.id}`}
                    checked={formData.relatedAthleteIds.includes(athlete.id)}
                    onChange={(e) => handleAthleteSelection(athlete.id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label 
                    htmlFor={`athlete-${athlete.id}`} 
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {athlete.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Attachments</Label>
            <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Drop files here or click to browse
              </p>
              <input type="file" multiple className="hidden" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Create Task' : 'Update Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
