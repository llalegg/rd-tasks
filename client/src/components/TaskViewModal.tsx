import React, { useState, useEffect } from "react";
import { Task, User, Athlete, InsertTask } from "@shared/schema";
import { TaskWithRelations, taskTypes } from "@/data/mockData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, User as UserIcon, Target, Clock, AlertCircle, CheckCircle, X, FileText, Plus, Send, MoreVertical, ChevronDown, Edit3, Check, Undo2, Trash2, Circle, ChevronUp, Minus, Search } from "lucide-react";
import DeadlineBadge from "./DeadlineBadge";
import UserAvatar from "./UserAvatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface TaskViewModalProps {
  task: TaskWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (taskId: string, newStatus: Task['status']) => void;
  onDeleteTask?: (taskId: string) => void;
}

interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

interface HistoryEntry {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export default function TaskViewModal({ task, isOpen, onClose, onStatusUpdate, onDeleteTask }: TaskViewModalProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [commentText, setCommentText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [athleteSearchQuery, setAthleteSearchQuery] = useState('');
  const [showAthleteDropdown, setShowAthleteDropdown] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Always call hooks before any early returns
  // Fetch users for assignee and creator
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: isOpen && !!task
  });

  // Fetch athletes
  const { data: athletes = [] } = useQuery<Athlete[]>({
    queryKey: ['/api/athletes'],
    enabled: isOpen && !!task
  });

  // Check if this is a new task
  const isNewTask = task?.id.startsWith('new-');

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: InsertTask & { relatedAthleteIds?: string[] }) => {
      const response = await apiRequest('POST', '/api/tasks', taskData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      onClose(); // Close modal after successful creation
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (updateData: { 
      name?: string; 
      description?: string; 
      status?: Task['status'];
      priority?: string;
      deadline?: string | null;
      assigneeId?: string;
      type?: string;
      relatedAthleteIds?: string[];
    }) => {
      if (!task) throw new Error('No task');
      
      if (isNewTask) {
        // For new tasks, create them instead of updating
        const fullTaskData = {
          name: updateData.name || task.name,
          description: updateData.description || task.description || '',
          type: task.type,
          status: updateData.status || task.status,
          priority: (updateData.priority || task.priority) as 'low' | 'medium' | 'high',
          deadline: updateData.deadline !== undefined ? (updateData.deadline ? new Date(updateData.deadline) : null) : (task.deadline ? new Date(task.deadline) : null),
          assigneeId: updateData.assigneeId || task.assigneeId,
          creatorId: task.creatorId,
          comment: task.comment,
          relatedAthleteIds: updateData.relatedAthleteIds || task.relatedAthleteIds || []
        };
        return await createTaskMutation.mutateAsync(fullTaskData);
      }
      
      const response = await apiRequest('PUT', `/api/tasks/${task.id}`, updateData);
      const updatedTask = await response.json();
      return updatedTask;
    },
    onSuccess: (updatedTask: any) => {
      // Update the specific task in the cache instead of invalidating all queries
      queryClient.setQueryData(['/api/tasks'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((t: any) => t.id === updatedTask.id ? updatedTask : t);
      });
      
      // Only close modal if this was a new task creation
      if (isNewTask) {
        toast({
          title: "Success",
          description: "Task created successfully",
        });
        onClose(); // Close modal only for new task creation
      }
      
      // For regular updates, just show a subtle success indication
      // (no toast to avoid spam during frequent updates)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      if (!task) throw new Error('No task');
      await apiRequest('DELETE', `/api/tasks/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      if (onDeleteTask && task) {
        onDeleteTask(task.id);
      }
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  // Initialize edit states when task changes (only when task ID changes)
  const [lastTaskId, setLastTaskId] = useState<string | null>(null);
  
  useEffect(() => {
    if (task && task.id !== lastTaskId) {
      setEditedTitle(task.name);
      setEditedDescription(task.description || '');
      setLastTaskId(task.id);
      
      // Mock comments data
      setComments([
        {
          id: '1',
          text: 'This is my comment',
          authorId: '1',
          authorName: 'John Withington',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          text: 'This is my comment',
          authorId: '1',
          authorName: 'John Withington',
          createdAt: new Date().toISOString()
        }
      ]);

      // Mock history data
      setHistory([
        {
          id: '1',
          action: 'Task created',
          userId: task.creatorId,
          userName: 'John Withington',
          createdAt: new Date(task.createdAt).toISOString()
        },
        {
          id: '2',
          action: 'Status changed',
          field: 'status',
          oldValue: 'pending',
          newValue: 'new',
          userId: task.assigneeId,
          userName: 'Sarah Johnson',
          createdAt: new Date(task.updatedAt || task.createdAt).toISOString()
        }
      ]);
    }
  }, [task, lastTaskId]);

  // Auto-save for title with debounce
  useEffect(() => {
    if (task && editedTitle && editedTitle.trim() !== '' && !isEditingTitle) {
      // For new tasks, only save if title is different from default
      const shouldSave = isNewTask 
        ? editedTitle.trim() !== 'New task' && editedTitle.trim() !== task.name
        : editedTitle.trim() !== task.name;
        
      if (shouldSave) {
        const timeoutId = setTimeout(() => {
          updateTaskMutation.mutate({ name: editedTitle.trim() });
        
          // Add history entry
          const newHistoryEntry: HistoryEntry = {
            id: Date.now().toString(),
            action: 'Title changed',
            field: 'name',
            oldValue: task.name,
            newValue: editedTitle.trim(),
            userId: '1',
            userName: 'Current User',
            createdAt: new Date().toISOString()
          };
          setHistory(prev => [newHistoryEntry, ...prev]);
        }, 1000); // 1 second debounce

        return () => clearTimeout(timeoutId);
      }
    }
  }, [editedTitle, task?.name, isEditingTitle, updateTaskMutation, task, isNewTask]);

  // Auto-save for description with debounce
  useEffect(() => {
    if (task && editedDescription !== (task.description || '') && !isEditingDescription) {
      // For new tasks, only save if description is not empty
      const shouldSave = isNewTask 
        ? editedDescription.trim() !== ''
        : true;
        
      if (shouldSave) {
        const timeoutId = setTimeout(() => {
          updateTaskMutation.mutate({ description: editedDescription });
        
          // Add history entry
          const newHistoryEntry: HistoryEntry = {
            id: Date.now().toString(),
            action: 'Description changed',
            field: 'description',
            oldValue: task.description || '',
            newValue: editedDescription,
            userId: '1',
            userName: 'Current User',
            createdAt: new Date().toISOString()
          };
          setHistory(prev => [newHistoryEntry, ...prev]);
        }, 1000); // 1 second debounce

        return () => clearTimeout(timeoutId);
      }
    }
  }, [editedDescription, task?.description, isEditingDescription, updateTaskMutation, task, isNewTask]);

  // Close athlete dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAthleteDropdown) {
        setShowAthleteDropdown(false);
        setAthleteSearchQuery('');
      }
    };

    if (showAthleteDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAthleteDropdown]);

  const assignee = task ? users.find(u => u.id === task.assigneeId) : null;
  const creator = task ? users.find(u => u.id === task.creatorId) : null;
  const relatedAthletes = task?.relatedAthleteIds 
    ? task.relatedAthleteIds.map(id => athletes.find(a => a.id === id)).filter(Boolean) as Athlete[]
    : [];

  const formatTaskType = (type: string) => {
    // Handle camelCase words by splitting on capital letters
    return type
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .replace(/\b\w/g, str => str.toUpperCase()); // Capitalize each word
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusIcon = () => (
    <Circle className="w-4 h-4" style={{ color: '#ff8254' }} />
  );

  const formatDateForInput = (dateValue: string | Date | null | undefined) => {
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    } catch {
      return '';
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

  // Handler functions for saving and canceling edits
  const handleSaveTitle = () => {
    if (task && editedTitle.trim() !== '') {
      setIsEditingTitle(false);
      // The auto-save effect will handle the actual saving
    }
  };

  const handleSaveDescription = () => {
    if (task) {
      setIsEditingDescription(false);
      // The auto-save effect will handle the actual saving
    }
  };

  const handleCancelEdit = (field: 'title' | 'description') => {
    if (field === 'title') {
      setEditedTitle(isNewTask ? (editedTitle || 'New task') : (task?.name || ''));
      setIsEditingTitle(false);
    } else {
      setEditedDescription(task?.description || '');
      setIsEditingDescription(false);
    }
  };

  // Handlers for property updates
  const handlePriorityChange = (priority: string) => {
    if (task) {
      updateTaskMutation.mutate({ priority });
    }
  };

  const handleDeadlineChange = (deadline: string | undefined) => {
    if (task) {
      // Convert deadline string to proper format, null to clear, or undefined to not change
      let deadlineValue: string | null | undefined;
      if (deadline === '' || deadline === undefined) {
        deadlineValue = null; // Clear the deadline
      } else {
        try {
          const date = new Date(deadline);
          // Check if the date is valid
          if (isNaN(date.getTime())) {
            console.error('Invalid date:', deadline);
            return;
          }
          deadlineValue = date.toISOString();
        } catch (error) {
          console.error('Error parsing date:', deadline, error);
          return;
        }
      }
      updateTaskMutation.mutate({ deadline: deadlineValue });
    }
  };

  const handleTypeChange = (type: string) => {
    if (task) {
      updateTaskMutation.mutate({ type });
    }
  };

  const handleAssigneeChange = (assigneeId: string) => {
    if (task) {
      // Don't set assigneeId to empty string as it's required in the schema
      if (assigneeId && assigneeId !== 'unassigned') {
        updateTaskMutation.mutate({ assigneeId });
      }
    }
  };

  // Athletic management handlers
  const handleAddAthlete = (athleteId: string) => {
    if (task && !task.relatedAthleteIds?.includes(athleteId)) {
      const newAthleteIds = [...(task.relatedAthleteIds || []), athleteId];
      updateTaskMutation.mutate({ relatedAthleteIds: newAthleteIds });
    }
    setShowAthleteDropdown(false);
    setAthleteSearchQuery('');
  };

  const handleRemoveAthlete = (athleteId: string) => {
    if (task) {
      const newAthleteIds = task.relatedAthleteIds?.filter(id => id !== athleteId) || [];
      updateTaskMutation.mutate({ relatedAthleteIds: newAthleteIds });
    }
  };

  // Filter athletes based on search query
  const filteredAthletes = athletes.filter(athlete =>
    athlete.name.toLowerCase().includes(athleteSearchQuery.toLowerCase()) &&
    !task?.relatedAthleteIds?.includes(athlete.id)
  );

  const getPriorityBadge = (priority: string) => {
    const getPriorityStyles = () => {
      switch (priority.toLowerCase()) {
        case 'high':
          return {
            bgColor: '#321a1a',
            textColor: '#f87171',
            icon: <ChevronUp className="w-4 h-4" style={{ color: '#f87171' }} />
          };
        case 'medium':
          return {
            bgColor: 'rgba(255, 255, 255, 0.08)',
            textColor: '#3f83f8',
            icon: <ChevronDown className="w-4 h-4" style={{ color: '#3f83f8' }} />
          };
        case 'low':
          return {
            bgColor: 'rgba(255, 255, 255, 0.08)',
            textColor: '#979795',
            icon: <Minus className="w-4 h-4" style={{ color: '#979795' }} />
          };
        default:
          return {
            bgColor: 'rgba(255, 255, 255, 0.08)',
            textColor: '#3f83f8',
            icon: <ChevronDown className="w-4 h-4" style={{ color: '#3f83f8' }} />
          };
      }
    };

    const styles = getPriorityStyles();

    return (
      <div 
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium h-5"
        style={{ backgroundColor: styles.bgColor, color: styles.textColor }}
      >
        {styles.icon}
        <span>{priority}</span>
      </div>
    );
  };

  const getStatusBadge = (status: Task['status']) => {
    const getStatusStyles = () => {
      switch (status.toLowerCase()) {
        case 'new':
          return {
            bgColor: '#31180f',
            textColor: '#ff8254'
          };
        case 'in_progress':
          return {
            bgColor: '#162949',
            textColor: '#3f83f8'
          };
        case 'pending':
          return {
            bgColor: '#321a1a',
            textColor: '#f87171'
          };
        case 'completed':
          return {
            bgColor: '#072a15',
            textColor: '#4ade80'
          };
        default:
          return {
            bgColor: '#31180f',
            textColor: '#ff8254'
          };
      }
    };

    const styles = getStatusStyles();
    const displayText = getStatusLabel(status);

    return (
      <span 
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium h-5"
        style={{ backgroundColor: styles.bgColor, color: styles.textColor }}
      >
        <span 
          className="w-2 h-2 rounded-full flex-shrink-0" 
          style={{ backgroundColor: styles.textColor }}
        ></span>
        {displayText}
      </span>
    );
  };

  const getDeadlineBadge = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const getDeadlineStyles = () => {
      if (diffDays < 0 || diffDays === 0) {
        // Overdue or due today
        return {
          backgroundColor: '#321a1a',
          color: '#f87171'
        };
      } else if (diffDays <= 2) {
        // Due soon
        return {
          backgroundColor: '#162949',
          color: '#3f83f8'
        };
      } else {
        // Future deadline
        return {
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          color: '#f7f6f2',
          backdropFilter: 'blur(20px)'
        };
      }
    };

    const formatDeadlineText = () => {
      if (diffDays === 0) return 'Today';
      if (diffDays === -1) return 'Yesterday';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
      if (diffDays <= 7) return `${diffDays}d`;
      
      return deadlineDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    };

    const styles = getDeadlineStyles();
    
    return (
      <div 
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium h-5"
        style={styles}
      >
        {formatDeadlineText()}
      </div>
    );
  };

  const getTypeBadge = (type: string) => (
    <div 
      className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium h-5"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(20px)',
        color: '#F7F6F2',
        fontFamily: 'Montserrat',
        fontSize: '12px',
        fontWeight: '500',
        lineHeight: '132%',
        textAlign: 'center' as const
      }}
    >
      {formatTaskType(type)}
    </div>
  );

  const handleStatusChange = (newStatus: Task['status']) => {
    if (task && newStatus !== task.status) {
      updateTaskMutation.mutate({ status: newStatus });
      
      // Add history entry
      const newHistoryEntry: HistoryEntry = {
        id: Date.now().toString(),
        action: 'Status changed',
        field: 'status',
        oldValue: getStatusLabel(task.status),
        newValue: getStatusLabel(newStatus),
        userId: '1', // Current user ID
        userName: 'Current User',
        createdAt: new Date().toISOString()
      };
      setHistory(prev => [newHistoryEntry, ...prev]);
      
      if (onStatusUpdate) {
        onStatusUpdate(task.id, newStatus);
      }
    }
  };

  const handleSendComment = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        text: commentText.trim(),
        authorId: '1', // Current user ID
        authorName: 'Current User',
        createdAt: new Date().toISOString()
      };
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      
      // Add history entry
      const newHistoryEntry: HistoryEntry = {
        id: Date.now().toString(),
        action: 'Comment added',
        userId: '1',
        userName: 'Current User',
        createdAt: new Date().toISOString()
      };
      setHistory(prev => [newHistoryEntry, ...prev]);
    }
  };

  const handleDeleteTask = () => {
    if (isNewTask) {
      // For new tasks, just close the modal
      onClose();
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      deleteTaskMutation.mutate();
    }
  };

  // Early return after all hooks are called
  if (!task) {
    return null;
  }

  // Mobile rendering with Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen && !!task} onOpenChange={onClose}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] p-0 bg-[#1c1c1b] border-none rounded-t-3xl overflow-hidden font-montserrat"
        >
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <SheetHeader className="p-4 border-b border-[#292928]">
              <div className="flex items-center justify-between">
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="bg-[#292928] border-none rounded-full px-3 py-2 text-[#f7f6f2] text-sm font-medium flex items-center gap-2 cursor-pointer w-auto h-9 font-montserrat hover:bg-[#3a3a38]">
                    <div className="flex items-center gap-2">
                      {getStatusIcon()}
                      <span>{getStatusLabel(task.status)}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#292928] border-[#3d3d3c]">
                    <SelectItem value="new" className="text-[#f7f6f2] focus:bg-[#3a3a38]">New</SelectItem>
                    <SelectItem value="in_progress" className="text-[#f7f6f2] focus:bg-[#3a3a38]">In Progress</SelectItem>
                    <SelectItem value="pending" className="text-[#f7f6f2] focus:bg-[#3a3a38]">Pending</SelectItem>
                    <SelectItem value="completed" className="text-[#f7f6f2] focus:bg-[#3a3a38]">Completed</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-9 h-9 bg-transparent border-none rounded-full cursor-pointer flex items-center justify-center text-[#f7f6f2] hover:bg-[rgba(247,246,242,0.1)] transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="bg-[#292928] border-[#3d3d3c] min-w-[120px]"
                    >
                      <DropdownMenuItem 
                        onClick={handleDeleteTask}
                        className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </SheetHeader>

            {/* Mobile Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {/* Task Title and Description */}
              <div className="p-4 border-b border-[#292928]">
                <div className="flex flex-col gap-3">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="text-lg font-medium text-[#f7f6f2] bg-[#292928] border-[#3d3d3c] flex-1 rounded-lg"
                        onBlur={handleSaveTitle}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveTitle}
                        className="h-9 w-9 p-0 bg-[#e5e4e1] hover:bg-[#d5d4d1] text-black"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 group">
                      <SheetTitle className="text-lg font-medium text-[#f7f6f2] leading-[1.54] flex-1">
                        {editedTitle || task.name || "New task"}
                      </SheetTitle>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditedTitle(editedTitle || task.name || "New task");
                          setIsEditingTitle(true);
                        }}
                        className="h-8 w-8 p-0 text-[#979795] hover:bg-[rgba(151,151,149,0.1)]"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    <div className="text-sm font-medium text-[#585856]">Description</div>
                    {isEditingDescription ? (
                      <div className="flex flex-col gap-2">
                        <Textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          className="text-sm font-normal text-[#f7f6f2] bg-[#292928] border-[#3d3d3c] min-h-[80px]"
                          placeholder="Add a description..."
                          onBlur={handleSaveDescription}
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveDescription}
                            className="h-9 px-4 bg-[#e5e4e1] hover:bg-[#d5d4d1] text-black text-sm"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Done
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelEdit('description')}
                            className="h-9 px-4 text-[#979795] hover:bg-[rgba(151,151,149,0.1)] text-sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="text-sm font-normal text-[#f7f6f2] p-3 rounded-lg bg-[#292928] cursor-pointer"
                        onClick={() => {
                          setEditedDescription(editedDescription || task.description || "");
                          setIsEditingDescription(true);
                        }}
                      >
                        {editedDescription || 'Tap to add a description...'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Properties */}
              <div className="p-4 border-b border-[#292928]">
                <div className="text-sm font-semibold text-[#f7f6f2] mb-3">Properties</div>
                <div className="flex flex-col gap-3">
                  {/* Priority */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-[#979795]">Priority</div>
                    <Select value={task.priority || 'medium'} onValueChange={handlePriorityChange}>
                      <SelectTrigger className="bg-[#292928] border-none rounded-lg px-3 py-2 h-9 w-auto cursor-pointer hover:bg-[#3a3a38]">
                        {getPriorityBadge(task.priority || 'medium')}
                      </SelectTrigger>
                      <SelectContent className="bg-[#292928] border-[#3d3d3c]">
                        <SelectItem value="high" className="text-[#f7f6f2] focus:bg-[#3a3a38]">
                          <div className="flex items-center gap-2">
                            <ChevronUp className="w-4 h-4" style={{ color: '#f87171' }} />
                            High
                          </div>
                        </SelectItem>
                        <SelectItem value="medium" className="text-[#f7f6f2] focus:bg-[#3a3a38]">
                          <div className="flex items-center gap-2">
                            <ChevronDown className="w-4 h-4" style={{ color: '#3f83f8' }} />
                            Medium
                          </div>
                        </SelectItem>
                        <SelectItem value="low" className="text-[#f7f6f2] focus:bg-[#3a3a38]">
                          <div className="flex items-center gap-2">
                            <Minus className="w-4 h-4" style={{ color: '#979795' }} />
                            Low
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-[#979795]">Deadline</div>
                    <input
                      type="date"
                      value={formatDateForInput(task.deadline)}
                      onChange={(e) => handleDeadlineChange(e.target.value === '' ? undefined : e.target.value)}
                      className="bg-[#292928] border border-[#3d3d3c] text-sm text-[#f7f6f2] rounded-lg px-3 py-2 h-9 cursor-pointer outline-none"
                      placeholder="No deadline"
                    />
                  </div>

                  {/* Type */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-[#979795]">Type</div>
                    <Select value={task.type} onValueChange={handleTypeChange}>
                      <SelectTrigger className="bg-[#292928] border-none rounded-lg px-3 py-2 h-9 w-auto cursor-pointer hover:bg-[#3a3a38]">
                        {getTypeBadge(task.type)}
                      </SelectTrigger>
                      <SelectContent className="bg-[#292928] border-[#3d3d3c]">
                        {taskTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-[#f7f6f2] focus:bg-[#3a3a38]">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assignee */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-[#979795]">Assignee</div>
                    <Select value={task.assigneeId || 'unassigned'} onValueChange={(value) => handleAssigneeChange(value === 'unassigned' ? '' : value)}>
                      <SelectTrigger className="bg-[#292928] border-none rounded-lg px-3 py-2 h-9 w-auto cursor-pointer hover:bg-[#3a3a38]">
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#4ade80] flex items-center justify-center text-xs font-semibold text-white">
                              {assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="text-sm font-medium text-[#f7f6f2]">{assignee.name}</div>
                          </div>
                        ) : (
                          <div className="text-sm font-normal text-[#979795]">Unassigned</div>
                        )}
                      </SelectTrigger>
                      <SelectContent className="bg-[#292928] border-[#3d3d3c]">
                        <SelectItem value="unassigned" className="text-[#f7f6f2] focus:bg-[#3a3a38]">
                          Unassigned
                        </SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id} className="text-[#f7f6f2] focus:bg-[#3a3a38]">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-[#4ade80] flex items-center justify-center text-xs font-semibold text-white">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              {user.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Mobile Related Athletes */}
              {relatedAthletes.length > 0 && (
                <div className="p-4 border-b border-[#292928]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-[#f7f6f2]">Related athletes</div>
                    <button 
                      onClick={() => setShowAthleteDropdown(!showAthleteDropdown)}
                      className="w-8 h-8 bg-transparent border-none rounded-full cursor-pointer flex items-center justify-center text-[#f7f6f2] hover:bg-[rgba(247,246,242,0.1)]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {relatedAthletes.map((athlete, index) => (
                      <div key={athlete.id} className="flex items-center gap-3 p-3 bg-[#292928] rounded-lg">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                          style={{
                            backgroundColor: ['#4ade80', '#3b82f6', '#f59e0b'][index % 3]
                          }}
                        >
                          {athlete.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-[#f7f6f2]">{athlete.name}</div>
                          <div className="text-xs text-[#979795]">Athlete</div>
                        </div>
                        <button 
                          onClick={() => handleRemoveAthlete(athlete.id)}
                          className="w-8 h-8 bg-transparent border-none rounded-full cursor-pointer flex items-center justify-center text-[#979795] hover:bg-[rgba(151,151,149,0.1)]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Comments Section */}
              <div className="p-4">
                <div className="flex border-b border-[#292928] mb-4">
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`px-4 py-3 text-sm font-medium cursor-pointer relative transition-colors ${
                      activeTab === 'comments' ? 'text-[#f7f6f2]' : 'text-[#979795]'
                    }`}
                  >
                    Comments
                    {activeTab === 'comments' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e5e4e1]"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-3 text-sm font-medium cursor-pointer relative transition-colors ${
                      activeTab === 'history' ? 'text-[#f7f6f2]' : 'text-[#979795]'
                    }`}
                  >
                    History
                    {activeTab === 'history' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e5e4e1]"></div>
                    )}
                  </button>
                </div>

                {activeTab === 'comments' ? (
                  <div className="flex flex-col gap-4">
                    {/* Mobile Message Input */}
                    <div className="border border-[#3d3d3c] rounded-lg p-3">
                      <input
                        type="text"
                        className="bg-transparent border-none outline-none text-[#f7f6f2] text-sm w-full py-2 mb-2 placeholder-[#585856]"
                        placeholder="Write a comment"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && commentText.trim() && handleSendComment()}
                      />
                      <div className="flex items-center justify-between">
                        <button className="w-9 h-9 rounded-full border-none bg-[#292928] flex items-center justify-center cursor-pointer hover:bg-[#3a3a38]">
                          <Plus className="w-4 h-4 text-[#f7f6f2]" />
                        </button>
                        <button
                          onClick={handleSendComment}
                          disabled={!commentText.trim()}
                          className={`w-9 h-9 rounded-full border-none flex items-center justify-center transition-colors ${
                            commentText.trim() 
                              ? 'bg-white hover:bg-[#f3f4f6] cursor-pointer' 
                              : 'bg-[#374151] cursor-not-allowed'
                          }`}
                        >
                          <Send className={`w-4 h-4 ${commentText.trim() ? 'text-black' : 'text-[#6b7280]'}`} />
                        </button>
                      </div>
                    </div>

                    {/* Mobile Comments List */}
                    <div className="flex flex-col gap-3">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-[#292928] rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-[#4ade80] flex items-center justify-center text-xs font-semibold text-white">
                              {comment.authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="text-sm font-medium text-[#f7f6f2]">{comment.authorName}</div>
                            <div className="text-xs text-[#979795] ml-auto">{formatDateTime(comment.createdAt)}</div>
                          </div>
                          <div className="text-sm text-[#f7f6f2] leading-relaxed">{comment.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Mobile History Tab */
                  <div className="flex flex-col gap-3">
                    {history.map((entry) => (
                      <div key={entry.id} className="bg-[#292928] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-[#3b82f6] flex items-center justify-center text-xs font-semibold text-white">
                            {entry.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-[#f7f6f2]">{entry.userName}</div>
                          <div className="text-xs text-[#979795] ml-auto">{formatDateTime(entry.createdAt)}</div>
                        </div>
                        <div className="text-sm text-[#f7f6f2]">
                          {entry.action}
                          {entry.field && entry.oldValue && entry.newValue && (
                            <span className="text-[#979795]"> from "{entry.oldValue}" to "{entry.newValue}"</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop rendering with Dialog
  return (
    <Dialog open={isOpen && !!task} onOpenChange={onClose}>
      <DialogContent className="max-w-[960px] h-[680px] p-0 bg-[#1c1c1b] border-none rounded-3xl overflow-hidden font-montserrat">
        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-4 p-6 overflow-y-auto">
        {/* Header */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between h-8">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-lg font-medium text-[#f7f6f2] bg-[#292928] border-[#3d3d3c] flex-1 rounded-lg"
                      onBlur={handleSaveTitle}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveTitle}
                      className="h-8 w-8 p-0 bg-[#e5e4e1] hover:bg-[#d5d4d1] text-black"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelEdit('title')}
                      className="h-8 w-8 p-0 text-[#979795] hover:bg-[rgba(151,151,149,0.1)]"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 group">
                    <DialogTitle className="text-lg font-medium text-[#f7f6f2] leading-[1.54]">
                      {editedTitle || task.name || "New task"}
                    </DialogTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditedTitle(editedTitle || task.name || "New task");
                        setIsEditingTitle(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-[#979795] hover:bg-[rgba(151,151,149,0.1)] transition-opacity"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium text-[#585856] leading-[1.32]">Description</div>
                {isEditingDescription ? (
                  <div className="flex flex-col gap-2">
                    <Textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="text-sm font-normal text-[#f7f6f2] bg-[#292928] border-[#3d3d3c] min-h-[60px]"
                      placeholder="Add a description..."
                      onBlur={handleSaveDescription}
                    />
                <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveDescription}
                        className="h-8 px-3 bg-[#e5e4e1] hover:bg-[#d5d4d1] text-black text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Done
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCancelEdit('description')}
                        className="h-8 px-3 text-[#979795] hover:bg-[rgba(151,151,149,0.1)] text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-sm font-normal text-[#f7f6f2] leading-[1.46] cursor-pointer group p-2 rounded hover:bg-[#292928] transition-colors"
                    onClick={() => {
                      setEditedDescription(editedDescription || task.description || "");
                      setIsEditingDescription(true);
                    }}
                  >
                    {editedDescription || 'Click to add a description...'}
                    <Edit3 className="w-3 h-3 ml-2 inline opacity-0 group-hover:opacity-100 transition-opacity text-[#979795]" />
                </div>
                )}
              </div>
            </div>

{/* Contextual Action Card - Hidden for now */}

            {/* Comments Section */}
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex border-b border-[#292928] relative">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`px-4 py-2.5 text-sm font-medium cursor-pointer relative transition-colors ${
                    activeTab === 'comments' ? 'text-[#f7f6f2]' : 'text-[#979795]'
                  }`}
                >
                  Comments
                  {activeTab === 'comments' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e5e4e1]"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2.5 text-sm font-medium cursor-pointer relative transition-colors ${
                    activeTab === 'history' ? 'text-[#f7f6f2]' : 'text-[#979795]'
                  }`}
                >
                  History
                  {activeTab === 'history' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e5e4e1]"></div>
                  )}
                </button>
              </div>

              {activeTab === 'comments' ? (
                <>
                  {/* Message Input */}
                  <div className="border border-[#3d3d3c] rounded-lg p-3">
                    <input
                      type="text"
                      className="bg-transparent border-none outline-none text-[#f7f6f2] text-sm font-montserrat w-full py-2 mb-1 placeholder-[#585856]"
                      placeholder="Write a comment"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && commentText.trim() && handleSendComment()}
                    />
                    <div className="flex items-center justify-between">
                      <button className="w-8 h-8 rounded-full border-none bg-[#292928] flex items-center justify-center cursor-pointer hover:bg-[#3a3a38] transition-colors">
                        <Plus className="w-4 h-4 text-[#f7f6f2]" />
                      </button>
                      <button
                        onClick={handleSendComment}
                        disabled={!commentText.trim()}
                        className={`w-8 h-8 rounded-full border-none flex items-center justify-center transition-colors ${
                          commentText.trim() 
                            ? 'bg-white hover:bg-[#f3f4f6] cursor-pointer' 
                            : 'bg-[#374151] cursor-not-allowed'
                        }`}
                      >
                        <Send className={`w-4 h-4 ${commentText.trim() ? 'text-black' : 'text-[#6b7280]'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="flex flex-col gap-2">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-[#292928] rounded-xl px-3 py-2 max-w-[600px]">
                        <div className="flex items-center gap-1.5 py-1 mb-1">
                          <div className="w-5 h-5 rounded-full bg-[#4ade80] flex items-center justify-center text-xs font-semibold text-white">
                            {comment.authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div className="text-xs font-medium text-[#f7f6f2] leading-[1.32]">{comment.authorName}</div>
                        </div>
                        <div className="text-xs font-normal text-[#979795] leading-[1.32] ml-6 mb-1">{formatDateTime(comment.createdAt)}</div>
                        <div className="text-sm font-normal text-[#f7f6f2] leading-[1.46]">{comment.text}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* History Tab */
                <div className="flex flex-col gap-2">
                  {history.map((entry) => (
                    <div key={entry.id} className="bg-[#292928] rounded-xl px-3 py-2">
                      <div className="flex items-center gap-1.5 py-1 mb-1">
                        <div className="w-5 h-5 rounded-full bg-[#3b82f6] flex items-center justify-center text-xs font-semibold text-white">
                          {entry.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="text-xs font-medium text-[#f7f6f2] leading-[1.32]">{entry.userName}</div>
                      </div>
                      <div className="text-xs font-normal text-[#979795] leading-[1.32] ml-6 mb-1">{formatDateTime(entry.createdAt)}</div>
                      <div className="text-sm font-normal text-[#f7f6f2] leading-[1.46]">
                        {entry.action}
                        {entry.field && entry.oldValue && entry.newValue && (
                          <span className="text-[#979795]"> from "{entry.oldValue}" to "{entry.newValue}"</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-[360px] bg-[#171716] p-4 flex flex-col gap-3 border-l border-[#292928] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Select value={task.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="bg-[#292928] border-none rounded-full px-3 py-2 text-[#f7f6f2] text-xs font-medium flex items-center gap-2 cursor-pointer w-[160px] h-8 font-montserrat hover:bg-[#3a3a38]">
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span>{getStatusLabel(task.status)}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#292928] border-[#3d3d3c]">
                  <SelectItem value="new" className="text-[#f7f6f2] focus:bg-[#3a3a38]">New</SelectItem>
                  <SelectItem value="in_progress" className="text-[#f7f6f2] focus:bg-[#3a3a38]">In Progress</SelectItem>
                  <SelectItem value="pending" className="text-[#f7f6f2] focus:bg-[#3a3a38]">Pending</SelectItem>
                  <SelectItem value="completed" className="text-[#f7f6f2] focus:bg-[#3a3a38]">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-8 h-8 bg-transparent border-none rounded-full cursor-pointer flex items-center justify-center text-[#f7f6f2] hover:bg-[rgba(247,246,242,0.1)] transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="bg-[#292928] border-[#3d3d3c] min-w-[120px]"
                  >
                    <DropdownMenuItem 
                      onClick={handleDeleteTask}
                      className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-transparent border-none rounded-full cursor-pointer flex items-center justify-center text-[#f7f6f2] hover:bg-[rgba(247,246,242,0.1)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Properties */}
            <div className="flex flex-col gap-4">
              <div className="text-sm font-semibold text-[#f7f6f2] leading-[1.46] h-8 flex items-center">Properties</div>
              
              <div className="flex flex-col gap-3">
                {/* Priority */}
                <div className="flex flex-col gap-1">
                  <div className="text-xs font-medium text-[#979795] leading-[1.32] text-left">Priority</div>
                  <Select value={task.priority || 'medium'} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="bg-[#171716] border-none rounded-lg px-2 py-1.5 h-8 flex items-center gap-1 cursor-pointer hover:bg-[#292928] transition-colors">
                      <div className="flex-1 flex items-center gap-1">
                        {getPriorityBadge(task.priority || 'medium')}
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#292928] border-[#3d3d3c]">
                      <SelectItem value="high" className="text-[#f7f6f2] focus:bg-[#3a3a38]">
                        <div className="flex items-center gap-2">
                          <ChevronUp className="w-4 h-4" style={{ color: '#f87171' }} />
                          High
                        </div>
                      </SelectItem>
                      <SelectItem value="medium" className="text-[#f7f6f2] focus:bg-[#3a3a38]">
                        <div className="flex items-center gap-2">
                          <ChevronDown className="w-4 h-4" style={{ color: '#3f83f8' }} />
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="low" className="text-[#f7f6f2] focus:bg-[#3a3a38]">
                        <div className="flex items-center gap-2">
                          <Minus className="w-4 h-4" style={{ color: '#979795' }} />
                          Low
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Deadline */}
                <div className="flex flex-col gap-1">
                  <div className="text-xs font-medium text-[#979795] leading-[1.32] text-left">Deadline</div>
                  <div className="bg-[#171716] rounded-lg px-2 py-1.5 h-8 flex items-center gap-1 cursor-pointer hover:bg-[#292928] transition-colors">
                    <input
                      type="date"
                      value={formatDateForInput(task.deadline)}
                      onChange={(e) => handleDeadlineChange(e.target.value === '' ? undefined : e.target.value)}
                      className="bg-transparent border-none text-xs font-normal text-[#f7f6f2] leading-[1.32] cursor-pointer outline-none w-full"
                      placeholder="No deadline"
                    />
                  </div>
                </div>

                {/* Type */}
                <div className="flex flex-col gap-1">
                  <div className="text-xs font-medium text-[#979795] leading-[1.32] text-left">Type</div>
                  <Select value={task.type} onValueChange={handleTypeChange}>
                    <SelectTrigger className="bg-[#171716] border-none rounded-lg px-2 py-1.5 h-8 flex items-center gap-1 cursor-pointer hover:bg-[#292928] transition-colors">
                      <div className="flex-1 flex items-center gap-1">
                        {getTypeBadge(task.type)}
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#292928] border-[#3d3d3c]">
                      {taskTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-[#f7f6f2] focus:bg-[#3a3a38]">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignee */}
                <div className="flex flex-col gap-1">
                  <div className="text-xs font-medium text-[#979795] leading-[1.32] text-left">Assignee</div>
                  <Select value={task.assigneeId || 'unassigned'} onValueChange={(value) => handleAssigneeChange(value === 'unassigned' ? '' : value)}>
                    <SelectTrigger className="bg-[#171716] border-none rounded-lg px-2 py-1.5 h-8 flex items-center gap-1 cursor-pointer hover:bg-[#292928] transition-colors">
                      <div className="flex-1 flex items-center gap-1">
                        {assignee ? (
                          <div className="flex items-center gap-1">
                            <div className="w-5 h-5 rounded-full bg-[#4ade80] flex items-center justify-center text-xs font-semibold text-white border border-[#292928]">
                              {assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="text-xs font-medium text-[#f7f6f2] leading-[1.32] overflow-hidden text-ellipsis whitespace-nowrap">{assignee.name}</div>
                          </div>
                        ) : (
                          <div className="text-xs font-normal text-[#979795] leading-[1.32]">Unassigned</div>
                        )}
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#292928] border-[#3d3d3c]">
                      <SelectItem value="unassigned" className="text-[#f7f6f2] focus:bg-[#3a3a38]">
                        Unassigned
                      </SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id} className="text-[#f7f6f2] focus:bg-[#3a3a38]">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-[#4ade80] flex items-center justify-center text-xs font-semibold text-white">
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            {user.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Created on */}
                <div className="flex flex-col gap-1">
                  <div className="text-xs font-medium text-[#979795] leading-[1.32] text-left">Created on</div>
                  <div className="bg-[#171716] rounded-lg px-2 py-1.5 h-8 flex items-center gap-1">
                    <div className="text-xs font-normal text-[#f7f6f2] leading-[1.32]">{formatDate(task.createdAt)}</div>
                  </div>
                </div>

                {/* Created by */}
                <div className="flex flex-col gap-1">
                  <div className="text-xs font-medium text-[#979795] leading-[1.32] text-left">Created by</div>
                  <div className="bg-[#171716] rounded-lg px-2 py-1.5 h-8 flex items-center gap-1">
                    {creator ? (
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-[#4ade80] flex items-center justify-center text-xs font-semibold text-white border border-[#292928]">
                          {creator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="text-xs font-medium text-[#f7f6f2] leading-[1.32] overflow-hidden text-ellipsis whitespace-nowrap">{creator.name}</div>
                      </div>
                    ) : (
                      <div className="text-xs font-normal text-[#979795] leading-[1.32]">Unknown</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-[#292928] my-2"></div>

            {/* Related Athletes */}
            <div className="flex flex-col gap-1 relative">
              <div className="flex items-center justify-between h-8">
                <div className="text-sm font-semibold text-[#f7f6f2] leading-[1.46]">Related athletes</div>
                <button 
                  onClick={() => setShowAthleteDropdown(!showAthleteDropdown)}
                  className="w-8 h-8 bg-transparent border-none rounded-full cursor-pointer flex items-center justify-center text-[#f7f6f2] hover:bg-[rgba(247,246,242,0.1)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Athlete Search Dropdown */}
              {showAthleteDropdown && (
                <div className="absolute top-10 right-0 bg-[#292928] border border-[#3d3d3c] rounded-lg shadow-lg z-50 w-64">
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Search className="w-4 h-4 text-[#979795]" />
                      <Input
                        type="text"
                        placeholder="Search athletes..."
                        value={athleteSearchQuery}
                        onChange={(e) => setAthleteSearchQuery(e.target.value)}
                        className="bg-[#171716] border-[#3d3d3c] text-[#f7f6f2] text-sm flex-1"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredAthletes.length > 0 ? (
                        filteredAthletes.map((athlete, index) => (
                          <div
                            key={athlete.id}
                            onClick={() => handleAddAthlete(athlete.id)}
                            className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer hover:bg-[#3a3a38] transition-colors"
                          >
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white border border-black border-opacity-70 flex-shrink-0"
                              style={{
                                backgroundColor: ['#4ade80', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
                              }}
                            >
                              {athlete.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                              <div className="text-xs font-medium text-[#f7f6f2] leading-[1.32] overflow-hidden text-ellipsis whitespace-nowrap">{athlete.name}</div>
                              <div className="text-[10px] font-normal text-[#979795] leading-[1.2] overflow-hidden text-ellipsis whitespace-nowrap">
                                {athlete.sport} {athlete.team ? `• ${athlete.team}` : ''}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-[#979795] text-center py-4">
                          {athleteSearchQuery ? 'No athletes found' : 'All athletes are already added'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-0">
                {relatedAthletes.map((athlete, index) => (
                  <div 
                    key={athlete.id} 
                    className="flex items-center gap-3 px-2 h-12 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#1c1c1b] group relative"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white border border-black border-opacity-70 flex-shrink-0"
                      style={{
                        backgroundColor: ['#4ade80', '#3b82f6', '#f59e0b'][index % 3]
                      }}
                    >
                      {athlete.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div className="text-xs font-medium text-[#f7f6f2] leading-[1.32] overflow-hidden text-ellipsis whitespace-nowrap">{athlete.name}</div>
                      <div className="text-[10px] font-normal text-[#979795] leading-[1.2] overflow-hidden text-ellipsis whitespace-nowrap">Athlete</div>
                    </div>
                    
                    {/* Action Buttons - Hidden by default, shown on hover */}
                    <div className="flex items-center gap-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 absolute right-2">
                      <button 
                        className="w-8 h-8 border-none rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 bg-transparent text-[#f7f6f2] hover:bg-[rgba(247,246,242,0.1)]"
                        title="Remove athlete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAthlete(athlete.id);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button 
                        className="w-8 h-8 border-none rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 bg-[#3d3d3c] text-[#f7f6f2] hover:bg-[#4a4a48]"
                        title="View athlete details"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle view athlete
                        }}
                      >
                        <span className="w-4 h-4 flex items-center justify-center">→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}