import { useState, useEffect } from "react";
import { Task, User, Athlete } from "@shared/schema";
import { taskTypes } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { X, Calendar, User as UserIcon, Users, Upload } from "lucide-react";

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
    comment: '',
    type: '',
    assigneeId: '',
    deadline: '',
    relatedAthleteIds: [] as string[]
  });

  // Fetch users and athletes
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: isOpen
  });

  const { data: athletes = [] } = useQuery<Athlete[]>({
    queryKey: ['/api/athletes'],
    enabled: isOpen
  });

  useEffect(() => {
    if (mode === 'edit' && task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        comment: task.comment || '',
        type: task.type,
        assigneeId: task.assigneeId,
        deadline: task.deadline ? task.deadline.toISOString().split('T')[0] : '',
        relatedAthleteIds: task.relatedAthleteIds || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        comment: '',
        type: '',
        assigneeId: '',
        deadline: '',
        relatedAthleteIds: []
      });
    }
  }, [mode, task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.type || !formData.assigneeId) {
      return; // Basic validation
    }
    
    const submitData = {
      ...formData,
      deadline: formData.deadline ? new Date(formData.deadline) : null,
      type: formData.type as any
    };
    onSubmit(submitData);
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">
                <UserIcon className="w-4 h-4 inline mr-1" />
                Assignee *
              </Label>
              <Select 
                value={formData.assigneeId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, assigneeId: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select assignee..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deadline" className="text-sm font-medium">
                <Calendar className="w-4 h-4 inline mr-1" />
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
            <Label htmlFor="comment" className="text-sm font-medium">
              Comment
            </Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              rows={2}
              className="mt-1"
              placeholder="Add any additional notes or comments..."
            />
          </div>

          <div>
            <Label className="text-sm font-medium">
              <Users className="w-4 h-4 inline mr-1" />
              Related Athletes
            </Label>
            <div className="mt-2">
              {formData.relatedAthleteIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.relatedAthleteIds.map(athleteId => {
                    const athlete = athletes.find(a => a.id === athleteId);
                    return athlete ? (
                      <Badge key={athleteId} variant="secondary" className="flex items-center gap-1">
                        {athlete.name}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => handleAthleteSelection(athleteId, false)}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
              <ScrollArea className="h-32 border rounded-md p-3">
                <div className="space-y-2">
                  {athletes.map((athlete) => (
                    <div key={athlete.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`athlete-${athlete.id}`}
                        checked={formData.relatedAthleteIds.includes(athlete.id)}
                        onCheckedChange={(checked) => handleAthleteSelection(athlete.id, !!checked)}
                      />
                      <label 
                        htmlFor={`athlete-${athlete.id}`} 
                        className="text-sm text-foreground cursor-pointer flex-1"
                      >
                        <div>
                          <div className="font-medium">{athlete.name}</div>
                          <div className="text-xs text-muted-foreground">{athlete.sport} • {athlete.team || 'Individual'}</div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
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
            <Button type="button" variant="outline" onClick={onClose} className="h-8 px-3 rounded-[9999px] bg-transparent border-[#F7F6F2] text-[#F7F6F2] hover:bg-[#1C1C1B] text-[14px] font-medium">
              Cancel
            </Button>
            <Button type="submit" className="h-8 px-3 rounded-[9999px] bg-[#E5E4E1] text-[#000000] hover:bg-[#CFCECA] text-[14px] font-semibold">
              {mode === 'create' ? 'Create Task' : 'Update Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
