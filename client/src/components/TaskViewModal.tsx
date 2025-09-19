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
import { Calendar, User as UserIcon, Target, Clock, AlertCircle, CheckCircle, X, FileText, Plus, Send, MoreVertical, ChevronDown, Edit3, Check, Undo2, Trash2, Circle, ChevronUp, Minus, Search, Paperclip } from "lucide-react";
import DeadlineBadge from "./DeadlineBadge";
import UserAvatar from "./UserAvatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/ui/date-picker";
import { useIsMobile } from "@/hooks/use-mobile";
import { InteractiveRow } from "@/components/ui/interactive-row";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StatusBadge } from "@/components/ui/status-badge";

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
  const [localTask, setLocalTask] = useState<Task | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Sync task prop with local state
  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  // Always call hooks before any early returns
  // Fetch users for assignee and creator
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: isOpen && !!localTask
  });

  // Fetch athletes
  const { data: athletes = [] } = useQuery<Athlete[]>({
    queryKey: ['/api/athletes'],
    enabled: isOpen && !!localTask
  });

  // Check if this is a new task
  const isNewTask = localTask?.id?.startsWith('new-');

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
      // Don't automatically close - let the calling code decide
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
      assigneeId?: string | null;
      type?: string;
      relatedAthleteIds?: string[];
    }) => {
      if (!localTask) throw new Error('No task');
      
      if (isNewTask) {
        // For new tasks, create them instead of updating
        const fullTaskData: any = {
          name: updateData.name || localTask.name,
          type: localTask.type,
          status: updateData.status || localTask.status,
          priority: (updateData.priority || localTask.priority) as 'low' | 'medium' | 'high',
          // Provide defaults for fields that are still required in DB but optional in our logic
          description: updateData.description || localTask.description || '',
          assigneeId: updateData.assigneeId || localTask.assigneeId || '1', // Default assignee
          creatorId: localTask.creatorId || '1', // Default creator
          relatedAthleteIds: updateData.relatedAthleteIds || (localTask as any).relatedAthleteIds || []
        };
        
        if (updateData.deadline !== undefined) {
          fullTaskData.deadline = updateData.deadline || null;
        } else if (localTask.deadline) {
          fullTaskData.deadline = localTask.deadline;
        }
        
        return await createTaskMutation.mutateAsync(fullTaskData);
      }
      
      const response = await apiRequest('PUT', `/api/tasks/${localTask.id}`, updateData);
      const updatedTask = await response.json();
      return updatedTask;
    },
    onSuccess: (updatedTask: any) => {
      // Update the specific task in the cache instead of invalidating all queries
      queryClient.setQueryData(['/api/tasks'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((t: any) => t.id === updatedTask.id ? updatedTask : t);
      });
      
      // Update local task state to reflect changes immediately
      setLocalTask(updatedTask);
      
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
      if (!localTask) throw new Error('No task');
      await apiRequest('DELETE', `/api/tasks/${localTask.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      if (onDeleteTask && localTask) {
        onDeleteTask(localTask.id);
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
    if (localTask && localTask.id !== lastTaskId) {
      setEditedTitle(localTask.name);
      setEditedDescription(localTask.description || '');
      setLastTaskId(localTask.id);
      
      // Only load comments for existing tasks, not new ones
      if (!isNewTask) {
        // Mock comments data for existing tasks
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
      } else {
        // New tasks start with no comments
        setComments([]);
      }

      // Mock history data
      setHistory([
        {
          id: '1',
          action: 'Task created',
          userId: localTask.creatorId || '1',
          userName: 'John Withington',
          createdAt: new Date(localTask.createdAt).toISOString()
        },
        {
          id: '2',
          action: 'Status changed',
          field: 'status',
          oldValue: 'pending',
          newValue: 'new',
          userId: localTask.assigneeId || '1',
          userName: 'Sarah Johnson',
          createdAt: new Date(localTask.updatedAt || localTask.createdAt).toISOString()
        }
      ]);
    }
  }, [localTask, lastTaskId]);

  // Auto-save for title with debounce
  useEffect(() => {
    if (localTask && editedTitle && editedTitle.trim() !== '' && !isEditingTitle) {
      // For new tasks, only save if title is different from default
      const shouldSave = isNewTask 
        ? editedTitle.trim() !== 'New task' && editedTitle.trim() !== localTask.name
        : editedTitle.trim() !== localTask.name;
        
      if (shouldSave) {
        const timeoutId = setTimeout(() => {
          updateTaskMutation.mutate({ name: editedTitle.trim() });
        
          // Add history entry
          const newHistoryEntry: HistoryEntry = {
            id: Date.now().toString(),
            action: 'Title changed',
            field: 'name',
            oldValue: localTask.name,
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
  }, [editedTitle, localTask?.name, isEditingTitle, updateTaskMutation, localTask, isNewTask]);

  // Auto-save for description with debounce
  useEffect(() => {
    if (localTask && editedDescription !== (localTask.description || '') && !isEditingDescription) {
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
            oldValue: localTask.description || '',
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
  }, [editedDescription, localTask?.description, isEditingDescription, updateTaskMutation, localTask, isNewTask]);

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

  const assignee = localTask ? users.find(u => u.id === localTask.assigneeId) : null;
  const creator = localTask ? users.find(u => u.id === localTask.creatorId) : null;
  const relatedAthletes = (localTask as any)?.relatedAthleteIds 
    ? (localTask as any).relatedAthleteIds.map((id: string) => athletes.find(a => a.id === id)).filter(Boolean) as Athlete[]
    : [];

  const formatTaskType = (type: string) => {
    // Create a mapping for better readability
    const typeMapping: { [key: string]: string } = {
      'mechanicalanalysis': 'Mechanical Analysis',
      'datareporting': 'Data Reporting',
      'injury': 'Injury',
      'generaltodo': 'General Task',
      'schedulecall': 'Schedule Call',
      'coachassignment': 'Coach Assignment',
      'createprogram': 'Create Program',
      'assessmentreview': 'Assessment Review'
    };
    
    // Return mapped value or fallback to formatted version
    if (typeMapping[type]) {
      return typeMapping[type];
    }
    
    // Fallback: Handle camelCase words by splitting on capital letters
    return type
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .replace(/\b\w/g, str => str.toUpperCase()) // Capitalize each word
      .replace(/\btodo\b/gi, 'Task'); // Replace "todo" with "Task" (case insensitive)
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
    if (localTask && editedTitle.trim() !== '') {
      setIsEditingTitle(false);
      // The auto-save effect will handle the actual saving
    }
  };

  const handleSaveDescription = () => {
    if (localTask) {
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

  const handleAttachFile = () => {
    // Mock function - not implemented
    toast({
      title: "Attach File",
      description: "File attachment feature is not yet implemented",
    });
  };

  // Handlers for property updates
  const handlePriorityChange = (priority: string) => {
    if (localTask) {
      updateTaskMutation.mutate({ priority });
    }
  };

  const handleDeadlineChange = (deadline: string | undefined) => {
    if (localTask) {
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
    if (localTask) {
      updateTaskMutation.mutate({ type });
    }
  };

  const handleAssigneeChange = (assigneeId: string) => {
    if (localTask) {
      // assigneeId is now optional, so we can set it to null for 'unassigned'
      if (assigneeId === 'unassigned') {
        updateTaskMutation.mutate({ assigneeId: null });
      } else {
        updateTaskMutation.mutate({ assigneeId });
      }
    }
  };

  // Athletic management handlers
  const handleAddAthlete = (athleteId: string) => {
    if (localTask && !(localTask as any).relatedAthleteIds?.includes(athleteId)) {
      const newAthleteIds = [...((localTask as any).relatedAthleteIds || []), athleteId];
      updateTaskMutation.mutate({ relatedAthleteIds: newAthleteIds });
    }
    setShowAthleteDropdown(false);
    setAthleteSearchQuery('');
  };

  const handleRemoveAthlete = (athleteId: string) => {
    if (localTask) {
      const newAthleteIds = (localTask as any).relatedAthleteIds?.filter((id: string) => id !== athleteId) || [];
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
    if (localTask && newStatus !== localTask.status) {
      updateTaskMutation.mutate({ status: newStatus });
      
      // Add history entry
      const newHistoryEntry: HistoryEntry = {
        id: Date.now().toString(),
        action: 'Status changed',
        field: 'status',
        oldValue: getStatusLabel(localTask?.status || 'new'),
        newValue: getStatusLabel(newStatus),
        userId: '1', // Current user ID
        userName: 'Current User',
        createdAt: new Date().toISOString()
      };
      setHistory(prev => [newHistoryEntry, ...prev]);
      
      if (onStatusUpdate) {
        onStatusUpdate(localTask?.id || '', newStatus);
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
  if (!localTask) {
    return null;
  }

  // Mobile rendering with Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen && !!localTask} onOpenChange={onClose}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] p-0 bg-[#1c1c1b] border-none rounded-t-3xl overflow-hidden font-montserrat"
        >
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <SheetHeader className="p-4 border-b border-[#292928]">
              <div className="flex items-center justify-between">
                <div></div>
                
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
                        {editedTitle || localTask.name || "New task"}
                      </SheetTitle>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditedTitle(editedTitle || localTask.name || "New task");
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
                        <div className="relative">
                          <Textarea
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            className="text-sm font-normal text-[#f7f6f2] bg-[#292928] border-[#3d3d3c] min-h-[80px] pr-10"
                            placeholder="Add a description..."
                            onBlur={handleSaveDescription}
                          />
                          <button
                            onClick={handleAttachFile}
                            className="absolute bottom-2 right-2 w-6 h-6 bg-transparent border-none rounded cursor-pointer flex items-center justify-center text-[#979795] hover:text-[#f7f6f2] transition-colors"
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>
                        </div>
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
                          setEditedDescription(editedDescription || localTask.description || "");
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
                <div className="flex flex-col gap-1">
                  {/* Status */}
                  <InteractiveRow
                    label="Status"
                    value={localTask.status}
                    badge={<StatusBadge status={localTask.status} />}
                    options={[
                      { value: 'new', label: 'New' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'pending', label: 'Blocked' },
                      { value: 'completed', label: 'Completed' }
                    ]}
                    onValueChange={(value) => handleStatusChange(value as Task['status'])}
                  />

                  {/* Priority */}
                  <InteractiveRow
                    label="Priority"
                    value={localTask.priority || 'medium'}
                    badge={<PriorityBadge priority={(localTask.priority || 'medium') as 'high' | 'medium' | 'low'} />}
                    options={[
                      { value: 'high', label: 'High' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'low', label: 'Low' }
                    ]}
                    onValueChange={handlePriorityChange}
                  />

                  {/* Deadline */}
                  <InteractiveRow
                    label="Deadline"
                    value={localTask.deadline ? localTask.deadline.toString() : 'no-deadline'}
                    badge={
                      <DatePicker
                        value={localTask.deadline ? new Date(localTask.deadline) : null}
                        onChange={(date) => handleDeadlineChange(date ? date.toISOString() : undefined)}
                        placeholder="No deadline"
                        variant="badge"
                        className="text-sm"
                      />
                    }
                    badgeClickable={true}
                  />

                  {/* Type */}
                  <InteractiveRow
                    label="Type"
                    value={localTask.type}
                    badge={getTypeBadge(localTask.type)}
                    options={taskTypes.map(type => ({
                      value: type.value,
                      label: formatTaskType(type.value)
                    }))}
                    onValueChange={handleTypeChange}
                  />

                  {/* Assignee */}
                  <InteractiveRow
                    label="Assignee"
                    value={localTask.assigneeId || 'unassigned'}
                    badge={
                      assignee ? (
                        <div className="flex items-center gap-2">
                          <UserAvatar userId={assignee.id} name={assignee.name} size="xs" />
                          <div className="text-sm font-medium text-[#f7f6f2]">{assignee.name}</div>
                        </div>
                      ) : (
                        <div className="text-sm font-normal text-[#979795]">Unassigned</div>
                      )
                    }
                    options={[
                      { value: 'unassigned', label: 'Unassigned' },
                      ...users.map(user => ({
                        value: user.id,
                        label: user.name
                      }))
                    ]}
                    onValueChange={(value) => handleAssigneeChange(value === 'unassigned' ? '' : value)}
                  />
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
                      {editedTitle || localTask.name || "New task"}
                    </DialogTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditedTitle(editedTitle || localTask.name || "New task");
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
                    <div className="relative">
                      <Textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="text-sm font-normal text-[#f7f6f2] bg-[#292928] border-[#3d3d3c] min-h-[60px] pr-10"
                        placeholder="Add a description..."
                        onBlur={handleSaveDescription}
                      />
                      <button
                        onClick={handleAttachFile}
                        className="absolute bottom-2 right-2 w-6 h-6 bg-transparent border-none rounded cursor-pointer flex items-center justify-center text-[#979795] hover:text-[#f7f6f2] transition-colors"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                    </div>
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
                      setEditedDescription(editedDescription || localTask.description || "");
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
              <div></div>
              
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
              
              <div className="flex flex-col gap-1">
                {/* Status */}
                <InteractiveRow
                  label="Status"
                  value={localTask.status}
                  badge={<StatusBadge status={localTask.status} />}
                  options={[
                    { value: 'new', label: 'New' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'pending', label: 'Blocked' },
                    { value: 'completed', label: 'Completed' }
                  ]}
                  onValueChange={(value) => handleStatusChange(value as Task['status'])}
                />

                {/* Priority */}
                <InteractiveRow
                  label="Priority"
                  value={localTask.priority || 'medium'}
                  badge={<PriorityBadge priority={(localTask.priority || 'medium') as 'high' | 'medium' | 'low'} />}
                  options={[
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' }
                  ]}
                  onValueChange={handlePriorityChange}
                />

                {/* Deadline */}
                <InteractiveRow
                  label="Deadline"
                  value={localTask.deadline ? localTask.deadline.toString() : 'no-deadline'}
                  badge={
                    <DatePicker
                      value={localTask.deadline ? new Date(localTask.deadline) : null}
                      onChange={(date) => handleDeadlineChange(date ? date.toISOString() : undefined)}
                      placeholder="No deadline"
                      variant="badge"
                      className="text-xs"
                    />
                  }
                  badgeClickable={true}
                />

                {/* Type */}
                <InteractiveRow
                  label="Type"
                  value={localTask.type}
                  badge={getTypeBadge(localTask.type)}
                  options={taskTypes.map(type => ({
                    value: type.value,
                    label: formatTaskType(type.value)
                  }))}
                  onValueChange={handleTypeChange}
                />

                {/* Assignee */}
                <InteractiveRow
                  label="Assignee"
                  value={localTask.assigneeId || 'unassigned'}
                  badge={
                    assignee ? (
                      <div className="flex items-center gap-1">
                        <UserAvatar userId={assignee.id} name={assignee.name} size="xs" />
                        <div className="text-xs font-medium text-[#f7f6f2] leading-[1.32] overflow-hidden text-ellipsis whitespace-nowrap">{assignee.name}</div>
                      </div>
                    ) : (
                      <div className="text-xs font-normal text-[#979795] leading-[1.32]">Unassigned</div>
                    )
                  }
                  options={[
                    { value: 'unassigned', label: 'Unassigned' },
                    ...users.map(user => ({
                      value: user.id,
                      label: user.name
                    }))
                  ]}
                  onValueChange={(value) => handleAssigneeChange(value === 'unassigned' ? '' : value)}
                />

                {/* Created on */}
                <InteractiveRow
                  label="Created on"
                  value="created-date"
                  badge={
                    <div className="text-xs font-normal text-[#f7f6f2] leading-[1.32]">{formatDate(localTask?.createdAt || new Date().toISOString())}</div>
                  }
                  disabled={true}
                />

                {/* Created by */}
                <InteractiveRow
                  label="Created by"
                  value="created-by"
                  badge={
                    creator ? (
                      <div className="flex items-center gap-1">
                        <UserAvatar userId={creator.id} name={creator.name} size="xs" />
                        <div className="text-xs font-medium text-[#f7f6f2] leading-[1.32] overflow-hidden text-ellipsis whitespace-nowrap">{creator.name}</div>
                      </div>
                    ) : (
                      <div className="text-xs font-normal text-[#979795] leading-[1.32]">Unknown</div>
                    )
                  }
                  disabled={true}
                />
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