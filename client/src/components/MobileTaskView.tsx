import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  Send,
  AlertTriangle,
  Minus,
  ArrowDown,
  Check,
  X,
  Edit3
} from "lucide-react";
import { Task } from "@shared/schema";

interface MobileTaskViewProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (taskId: string, newStatus: Task['status']) => void;
  onDeleteTask?: (taskId: string) => void;
  users?: any[];
  athletes?: any[];
}

interface Comment {
  id: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

interface HistoryEntry {
  id: string;
  action: string;
  author: string;
  authorId: string;
  details: string;
  createdAt: Date;
}

export function MobileTaskView({ 
  task, 
  isOpen, 
  onClose, 
  onStatusUpdate, 
  onDeleteTask,
  users = [],
  athletes = []
}: MobileTaskViewProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [commentText, setCommentText] = useState('');
  
  // Modal editing states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  
  // Badge editing modal states
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Temporary editing values for badge modal
  const [tempStatus, setTempStatus] = useState<Task['status']>(task?.status || 'new');
  const [tempPriority, setTempPriority] = useState<Task['priority']>(task?.priority || 'medium');
  const [tempType, setTempType] = useState(task?.type || 'generaltodo');
  const [tempAssigneeId, setTempAssigneeId] = useState(task?.assigneeId || '');
  
  // Scroll state for sticky header
  const [scrollY, setScrollY] = useState(0);
  const [showHeaderTitle, setShowHeaderTitle] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'John Withington',
      authorId: 'user1',
      content: 'This is my comment',
      createdAt: new Date('2024-07-20T00:16:00')
    },
    {
      id: '2',
      author: 'John Withington', 
      authorId: 'user1',
      content: 'This is another comment with more details about the task progress.',
      createdAt: new Date('2024-07-20T00:18:00')
    }
  ]);
  
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: '1',
      action: 'created',
      author: 'John Withington',
      authorId: 'user1',
      details: 'Task was created',
      createdAt: new Date('2024-07-19T10:00:00')
    },
    {
      id: '2',
      action: 'status_changed',
      author: 'John Withington',
      authorId: 'user1', 
      details: 'Status changed from New to In Progress',
      createdAt: new Date('2024-07-19T14:30:00')
    },
    {
      id: '3',
      action: 'assigned',
      author: 'Sarah Johnson',
      authorId: 'user2',
      details: 'Task assigned to John Withington',
      createdAt: new Date('2024-07-19T15:45:00')
    }
  ]);

  // Scroll listener for sticky header
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const currentScrollY = target.scrollTop;
      setScrollY(currentScrollY);
      
      // Show title in header when scrolled down past the task title section (around 120px)
      setShowHeaderTitle(currentScrollY > 120);
    };

    const scrollContainer = document.querySelector('.mobile-task-scroll');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen]);

  if (!isOpen || !task) return null;

  // Get status config - exact same as task list
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return {
          bgColor: '#31180f',
          textColor: '#ff8254',
          icon: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 18 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='%23ff8254' stroke-width='1.5' fill='none' d='M9 1v18M1 9l8-8 8 8'/%3E%3C/svg%3E\")",
          text: 'New'
        };
      case 'in_progress':
        return {
          bgColor: '#162949',
          textColor: '#3f83f8',
          icon: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 18 18' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='9' cy='9' r='7' stroke='%233f83f8' stroke-width='1.5' fill='none'/%3E%3Cpath stroke='%233f83f8' stroke-width='1.5' fill='none' d='M9 5v4l3 3'/%3E%3C/svg%3E\")",
          text: 'In progress'
        };
      case 'blocked':
        return {
          bgColor: '#321a1a',
          textColor: '#f87171',
          icon: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='8' stroke='%23f87171' stroke-width='1.5' fill='none'/%3E%3Cpath stroke='%23f87171' stroke-width='1.5' d='M6 6l8 8M14 6l-8 8'/%3E%3C/svg%3E\")",
          text: 'Blocked'
        };
      case 'completed':
        return {
          bgColor: '#072a15',
          textColor: '#4ade80',
          icon: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 16 11' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='%234ade80' stroke-width='1.5' fill='none' d='M1 5l4 4 9-9'/%3E%3C/svg%3E\")",
          text: 'Completed'
        };
      default:
        return {
          bgColor: '#31180f',
          textColor: '#ff8254',
          icon: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 18 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='%23ff8254' stroke-width='1.5' fill='none' d='M9 1v18M1 9l8-8 8 8'/%3E%3C/svg%3E\")",
          text: 'New'
        };
    }
  };

  // Deadline color function - exact same as task list
  const getDeadlineColor = (deadline: string | Date | undefined) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { bg: '#321a1a', text: '#f87171' }; // Overdue - red
    if (diffDays === 0) return { bg: '#302608', text: '#facc15' }; // Today - yellow
    if (diffDays <= 3) return { bg: '#302608', text: '#facc15' }; // Soon - yellow
    return { bg: '#2d2d2a', text: '#979795' }; // Normal - gray
  };

  // Get priority config - exact same as desktop
  const getPriorityConfig = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return {
          bgColor: '#321a1a',
          iconColor: '#f87171',
          icon: AlertTriangle,
          label: 'High'
        };
      case 'medium':
        return {
          bgColor: '#302608',
          iconColor: '#facc15',
          icon: Minus,
          label: 'Medium'
        };
      case 'low':
        return {
          bgColor: 'rgba(255,255,255,0.08)',
          iconColor: '#979795',
          icon: ArrowDown,
          label: 'Low'
        };
      default:
        return {
          bgColor: '#302608',
          iconColor: '#facc15',
          icon: Minus,
          label: 'Medium'
        };
    }
  };

  // Format deadline
  const formatDeadline = (deadline: string | Date | undefined) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} d ago`;
    if (diffDays <= 7) return `${diffDays} d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format task type
  const formatTaskType = (type: string) => {
    return type
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, str => str.toUpperCase())
      .replace(/\b\w/g, str => str.toUpperCase());
  };

  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.priority);
  const deadlineText = formatDeadline(task.deadline);
  const assignee = users.find(u => u.id === task.assigneeId);

  // Format date for comments/history
  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }) + ', ' + date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleSendComment = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        author: 'Current User', // In real app, get from auth context
        authorId: 'current_user',
        content: commentText.trim(),
        createdAt: new Date()
      };
      
      setComments(prev => [...prev, newComment]);
      setCommentText('');
      
      // Add to history
      const historyEntry: HistoryEntry = {
        id: Date.now().toString() + '_history',
        action: 'commented',
        author: 'Current User',
        authorId: 'current_user',
        details: `Added comment: "${commentText.trim().substring(0, 50)}${commentText.trim().length > 50 ? '...' : ''}"`,
        createdAt: new Date()
      };
      
      setHistory(prev => [...prev, historyEntry]);
    }
  };

  // Modal editing functions
  const handleOpenEditModal = () => {
    setEditedName(task.name);
    setEditedDescription(task.description || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    let hasChanges = false;
    
    if (editedName.trim() && editedName.trim() !== task.name) {
      // TODO: Call API to update task name
      console.log('Updating task name to:', editedName.trim());
      
      // Add to history
      const historyEntry: HistoryEntry = {
        id: Date.now().toString() + '_name_change',
        action: 'name_changed',
        author: 'Current User',
        authorId: 'current_user',
        details: `Task name changed from "${task.name}" to "${editedName.trim()}"`,
        createdAt: new Date()
      };
      setHistory(prev => [...prev, historyEntry]);
      hasChanges = true;
    }
    
    if (editedDescription.trim() !== (task.description || '')) {
      // TODO: Call API to update task description
      console.log('Updating task description to:', editedDescription.trim());
      
      // Add to history
      const historyEntry: HistoryEntry = {
        id: Date.now().toString() + '_desc_change',
        action: 'description_changed',
        author: 'Current User',
        authorId: 'current_user',
        details: `Task description updated`,
        createdAt: new Date()
      };
      setHistory(prev => [...prev, historyEntry]);
      hasChanges = true;
    }
    
    setIsEditModalOpen(false);
  };

  const handleCancelEdit = () => {
    setEditedName('');
    setEditedDescription('');
    setIsEditModalOpen(false);
  };

  // Badge modal functions
  const handleOpenBadgeModal = () => {
    // Initialize temp values with current task values
    setTempStatus(task.status);
    setTempPriority(task.priority);
    setTempType(task.type || 'generaltodo');
    setTempAssigneeId(task.assigneeId || '');
    setIsBadgeModalOpen(true);
  };

  const handleCloseBadgeModal = () => {
    setOpenDropdown(null);
    setIsBadgeModalOpen(false);
  };

  const handleSaveBadgeChanges = () => {
    let hasChanges = false;
    
    // Check for status changes
    if (tempStatus !== task.status) {
      onStatusUpdate?.(task.id, tempStatus);
      const historyEntry: HistoryEntry = {
        id: Date.now().toString() + '_status',
        action: 'status_changed',
        author: 'Current User',
        authorId: 'current_user',
        details: `Status changed from ${task.status} to ${tempStatus}`,
        createdAt: new Date()
      };
      setHistory(prev => [...prev, historyEntry]);
      hasChanges = true;
    }
    
    // Check for priority changes
    if (tempPriority !== task.priority) {
      console.log('Priority changed from', task.priority, 'to', tempPriority);
      const historyEntry: HistoryEntry = {
        id: Date.now().toString() + '_priority',
        action: 'priority_changed',
        author: 'Current User',
        authorId: 'current_user',
        details: `Priority changed from ${task.priority} to ${tempPriority}`,
        createdAt: new Date()
      };
      setHistory(prev => [...prev, historyEntry]);
      hasChanges = true;
    }
    
    // Check for type changes
    if (tempType !== task.type) {
      console.log('Type changed from', task.type, 'to', tempType);
      const historyEntry: HistoryEntry = {
        id: Date.now().toString() + '_type',
        action: 'type_changed',
        author: 'Current User',
        authorId: 'current_user',
        details: `Type changed from ${formatTaskType(task.type || '')} to ${formatTaskType(tempType)}`,
        createdAt: new Date()
      };
      setHistory(prev => [...prev, historyEntry]);
      hasChanges = true;
    }
    
    // Check for assignee changes
    if (tempAssigneeId !== task.assigneeId) {
      console.log('Assignee changed from', task.assigneeId, 'to', tempAssigneeId);
      const oldAssignee = users.find(u => u.id === task.assigneeId);
      const newAssignee = users.find(u => u.id === tempAssigneeId);
      const historyEntry: HistoryEntry = {
        id: Date.now().toString() + '_assignee',
        action: 'assignee_changed',
        author: 'Current User',
        authorId: 'current_user',
        details: `Assignee changed from ${oldAssignee?.name || 'Unassigned'} to ${newAssignee?.name || 'Unassigned'}`,
        createdAt: new Date()
      };
      setHistory(prev => [...prev, historyEntry]);
      hasChanges = true;
    }
    
    setIsBadgeModalOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  return (
    <div className="fixed inset-0 bg-[#0d0d0c] z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 h-[48px] bg-[#0d0d0c] relative z-10">
        <div className="flex items-center gap-3 flex-1">
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-[#f7f6f2]" />
          </button>
          
          {/* Task name appears when scrolling */}
          {showHeaderTitle && (
            <h2 className="font-montserrat text-[16px] font-medium leading-[1.5] text-[#f7f6f2] truncate">
              {task.name}
            </h2>
          )}
        </div>
        
        <button 
          onClick={() => onDeleteTask?.(task.id)}
          className="w-8 h-8 flex items-center justify-center rounded-[9999px] hover:bg-[rgba(255,255,255,0.1)] transition-colors"
        >
          <Trash2 className="w-4 h-4 text-[#f7f6f2]" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 mobile-task-scroll">
        {/* Task Header - Clickable Container */}
        <div 
          onClick={handleOpenEditModal}
          className="flex flex-col gap-3 mb-4 cursor-pointer hover:bg-[rgba(255,255,255,0.02)] rounded-lg p-3 -m-3 transition-colors"
        >
          <div className="flex gap-3 items-start">
            <h1 className="font-montserrat text-[18px] font-medium leading-[1.54] text-[#f7f6f2] flex-1">
              {task.name}
            </h1>
          </div>
          
          {/* Description */}
          <div className="flex flex-col gap-2">
            <span className="font-montserrat text-[12px] font-medium leading-[1.32] text-[#585856]">
              Description
            </span>
            <p className="font-montserrat text-[14px] font-normal leading-[1.46] text-[#f7f6f2]">
              {task.description || 'Task description'}
            </p>
          </div>
        </div>

        {/* Badges Section - Clickable */}
        <div 
          onClick={handleOpenBadgeModal}
          className="bg-[#171716] rounded-[16px] p-4 mb-4 cursor-pointer hover:bg-[#1a1a19] transition-colors"
        >
          <div className="flex flex-wrap gap-[8px] items-start">
            {/* Status Badge - exact same as task list */}
            <div 
              className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
              style={{ 
                backgroundColor: statusConfig.bgColor, 
                color: statusConfig.textColor,
                fontFamily: 'Montserrat',
                fontWeight: 500,
                fontSize: '12px',
                lineHeight: '1.32'
              }}
            >
              <div 
                className="w-4 h-4 flex-shrink-0"
                style={{
                  background: statusConfig.textColor,
                  maskImage: statusConfig.icon,
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  maskSize: 'contain',
                  width: '16px',
                  height: '16px'
                }}
              />
              <span>{statusConfig.text}</span>
            </div>

            {/* Priority Badge - exact same as task list */}
            {(() => {
              const IconComponent = priorityConfig.icon;
              return (
                <div 
                  className="flex items-center gap-1 px-2 py-0.5 rounded-[9999px]"
                  style={{ backgroundColor: priorityConfig.bgColor }}
                >
                  <IconComponent 
                    className="w-4 h-4 flex-shrink-0" 
                    style={{ color: priorityConfig.iconColor, width: '16px', height: '16px' }}
                  />
                  <span 
                    className="text-xs font-medium whitespace-nowrap"
                    style={{ 
                      color: priorityConfig.iconColor,
                      fontFamily: 'Montserrat',
                      fontWeight: 500,
                      fontSize: '12px',
                      lineHeight: '1.32'
                    }}
                  >
                    {priorityConfig.label}
                  </span>
                </div>
              );
            })()}

            {/* Deadline Badge - exact same as task list */}
            {deadlineText && (() => {
              const deadlineColor = getDeadlineColor(task.deadline);
              return deadlineColor ? (
                <div 
                  className="flex gap-[4px] items-center justify-center px-[8px] py-[2px] rounded-[9999px]"
                  style={{ backgroundColor: deadlineColor.bg }}
                >
                  <span 
                    className="font-montserrat text-[12px] font-medium leading-[1.32]"
                    style={{ color: deadlineColor.text }}
                  >
                    {deadlineText}
                  </span>
                </div>
              ) : null;
            })()}

            {/* Category Badge - exact same as task list */}
            <div className="backdrop-blur-[20px] backdrop-filter bg-[rgba(0,0,0,0.25)] flex gap-[4px] items-center justify-center px-[8px] py-[2px] rounded-[9999px]">
              <span className="font-montserrat text-[12px] font-medium leading-[1.32] text-[#f7f6f2]">
                {formatTaskType(task.type || 'Task')}
              </span>
            </div>

            {/* Assignee - exact same as task list */}
            {assignee && (
              <div className="flex gap-[4px] items-center">
                <div 
                  className="w-[20px] h-[20px] rounded-full bg-cover bg-center border border-[#292928]"
                  style={{ 
                    backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=20&h=20&fit=crop&crop=face')"
                  }}
                />
                <span className="font-montserrat text-[12px] font-medium leading-[1.32] text-[#f7f6f2] overflow-ellipsis overflow-hidden text-nowrap">
                  {assignee.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Related Athletes Section */}
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex gap-1 h-8 items-center">
            <h2 className="flex-1 font-montserrat text-[14px] font-semibold leading-[1.46] text-[#f7f6f2]">
              Related athletes
            </h2>
            <button className="w-8 h-8 flex items-center justify-center rounded-[9999px]">
              <Plus className="w-4 h-4 text-[#f7f6f2]" />
            </button>
          </div>

          {/* Athletes List */}
          <div className="space-y-0">
            {athletes.slice(0, 3).map((athlete, index) => (
              <div key={athlete.id || index} className="flex gap-2 h-12 items-center px-2 rounded-lg">
                <div 
                  className="w-8 h-8 rounded-full bg-cover bg-center border border-[rgba(0,0,0,0.7)]"
                  style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-${1472099645785 + index}-5658abf4ff4e?w=32&h=32&fit=crop&crop=face')`
                  }}
                />
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className="font-montserrat text-[12px] font-medium leading-[1.32] text-[#f7f6f2] overflow-ellipsis overflow-hidden text-nowrap">
                    {athlete.name || `Christopher Harris`}
                  </span>
                  <span className="font-montserrat text-[10px] font-normal leading-[1.2] text-[#979795] overflow-ellipsis overflow-hidden text-nowrap">
                    Athlete
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="flex flex-col gap-4 mb-4">
          {/* Tab Row */}
          <div className="flex items-start border-b border-[#292928] relative">
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex flex-col items-center justify-center px-4 py-2.5 relative ${
                activeTab === 'comments' ? 'text-[#f7f6f2]' : 'text-[#979795]'
              }`}
            >
              <span className="font-montserrat text-[14px] font-medium leading-[1.46]">
                Comments
              </span>
              {activeTab === 'comments' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e5e4e1]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center px-4 py-2.5 w-[95px] ${
                activeTab === 'history' ? 'text-[#f7f6f2]' : 'text-[#979795]'
              }`}
            >
              <span className="font-montserrat text-[14px] font-medium leading-[1.46]">
                History
              </span>
            </button>
          </div>

          {/* Comment Input */}
          <div className="rounded-lg border border-[#3d3d3c] relative">
            <div className="flex flex-col gap-1 justify-center overflow-hidden pb-2 pt-0 px-3">
              <div className="flex items-center overflow-hidden px-0 py-2 rounded-lg">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment"
                  className="flex-1 font-montserrat text-[14px] font-normal leading-[1.46] text-[#585856] bg-transparent border-none outline-none placeholder-[#585856]"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-1 items-center">
                  <button className="bg-[#292928] w-8 h-8 flex items-center justify-center p-1.5 rounded-[9999px]">
                    <Plus className="w-4 h-4 text-[#f7f6f2]" />
                  </button>
                </div>
                <button 
                  onClick={handleSendComment}
                  className="bg-[#322e21] w-8 h-8 flex items-center justify-center p-1.5 rounded-[9999px]"
                >
                  <Send className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          {activeTab === 'comments' && (
            <div className="flex flex-col gap-2">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <span className="font-montserrat text-[14px] font-normal leading-[1.46] text-[#979795]">
                    No comments yet. Be the first to comment!
                  </span>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex flex-col gap-2">
                    <div className="bg-[#292928] rounded-[12px] p-3 max-w-[600px]">
                      <div className="flex flex-col gap-1 px-0 py-1 rounded-full">
                        <div className="flex gap-1.5 items-center">
                          <div 
                            className="w-5 h-5 rounded-full bg-cover bg-center border border-[#292928]"
                            style={{ 
                              backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=20&h=20&fit=crop&crop=face')"
                            }}
                          />
                          <span className="font-montserrat text-[12px] font-medium leading-[1.32] text-[#f7f6f2] overflow-ellipsis overflow-hidden text-nowrap">
                            {comment.author}
                          </span>
                        </div>
                        <div className="flex gap-2.5 items-center justify-center pl-[25px] pr-0">
                          <span className="font-montserrat text-[12px] font-normal leading-[1.32] text-[#979795]">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="font-montserrat text-[14px] font-normal leading-[1.46] text-[#f7f6f2] min-w-full">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* History List */}
          {activeTab === 'history' && (
            <div className="flex flex-col gap-2">
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <span className="font-montserrat text-[14px] font-normal leading-[1.46] text-[#979795]">
                    No history available.
                  </span>
                </div>
              ) : (
                history.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((entry) => (
                  <div key={entry.id} className="flex flex-col gap-2">
                    <div className="bg-[#1c1c1b] rounded-[12px] p-3 border border-[#292928]">
                      <div className="flex flex-col gap-1 px-0 py-1">
                        <div className="flex gap-1.5 items-center">
                          <div 
                            className="w-5 h-5 rounded-full bg-cover bg-center border border-[#292928]"
                            style={{ 
                              backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=20&h=20&fit=crop&crop=face')"
                            }}
                          />
                          <span className="font-montserrat text-[12px] font-medium leading-[1.32] text-[#f7f6f2] overflow-ellipsis overflow-hidden text-nowrap">
                            {entry.author}
                          </span>
                          <span className="font-montserrat text-[10px] font-normal leading-[1.2] text-[#979795] capitalize">
                            {entry.action.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex gap-2.5 items-center justify-center pl-[25px] pr-0">
                          <span className="font-montserrat text-[12px] font-normal leading-[1.32] text-[#979795]">
                            {formatDateTime(entry.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="font-montserrat text-[14px] font-normal leading-[1.46] text-[#f7f6f2] min-w-full">
                        {entry.details}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1b] rounded-[16px] w-full max-w-md overflow-hidden">
            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Task Name Input */}
              <div className="space-y-2">
                <label className="font-montserrat text-[12px] font-medium leading-[1.32] text-[#585856]">
                  Task Name
                </label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full font-montserrat text-[14px] font-normal leading-[1.46] text-[#f7f6f2] bg-[#292928] border border-[#3d3d3c] rounded-lg px-3 py-2 outline-none focus:border-[#e5e4e1] transition-colors"
                  placeholder="Enter task name"
                />
              </div>

              {/* Task Description Input */}
              <div className="space-y-2">
                <label className="font-montserrat text-[12px] font-medium leading-[1.32] text-[#585856]">
                  Description
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full font-montserrat text-[14px] font-normal leading-[1.46] text-[#f7f6f2] bg-[#292928] border border-[#3d3d3c] rounded-lg px-3 py-2 outline-none focus:border-[#e5e4e1] min-h-[100px] resize-none transition-colors"
                  placeholder="Enter task description"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-2 font-montserrat text-[14px] font-medium leading-[1.46] text-[#979795] hover:bg-[rgba(151,151,149,0.1)] rounded-[9999px] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-[#e5e4e1] hover:bg-[#d5d4d1] text-black font-montserrat text-[14px] font-medium leading-[1.46] rounded-[9999px] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badge Editing Modal */}
      {isBadgeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1b] rounded-[16px] w-full max-w-md overflow-hidden">
            <div className="p-4 space-y-3">
              {/* Status Row */}
              <div className="relative">
                <div 
                  onClick={() => toggleDropdown('status')}
                  className="rounded-[8px] p-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between px-[8px] py-[6px] h-8">
                    <div className="flex items-center gap-1 flex-1">
                      <div className="font-medium text-xs leading-[1.32] text-[#979795] flex-shrink-0 w-[108px] font-montserrat">
                        Status
                      </div>
                      <div>
                        {(() => {
                          const tempStatusConfig = getStatusConfig(tempStatus);
                          return (
                            <div 
                              className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-[9999px] text-xs font-medium whitespace-nowrap"
                              style={{ 
                                backgroundColor: tempStatusConfig.bgColor, 
                                color: tempStatusConfig.textColor,
                                fontFamily: 'Montserrat',
                                fontWeight: 500,
                                fontSize: '12px',
                                lineHeight: '1.32'
                              }}
                            >
                              <div 
                                className="w-4 h-4 flex-shrink-0"
                                style={{
                                  background: tempStatusConfig.textColor,
                                  maskImage: tempStatusConfig.icon,
                                  maskRepeat: 'no-repeat',
                                  maskPosition: 'center',
                                  maskSize: 'contain',
                                  width: '16px',
                                  height: '16px'
                                }}
                              />
                              <span>{tempStatusConfig.text}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status Dropdown */}
                {openDropdown === 'status' && (
                  <div className="absolute top-full left-2 right-2 bg-[#292928] border border-[#3d3d3c] rounded-xl py-1 shadow-lg z-10 mt-1">
                    {(['new', 'in_progress', 'blocked', 'completed'] as Task['status'][]).map((status) => {
                      const config = getStatusConfig(status);
                      return (
                        <div
                          key={status}
                          className="flex items-center justify-between px-3 py-2 h-9 cursor-pointer transition-colors duration-150 gap-2 hover:bg-[rgba(255,255,255,0.04)]"
                          onClick={() => {
                            setTempStatus(status);
                            setOpenDropdown(null);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 flex-shrink-0"
                              style={{
                                background: config.textColor,
                                maskImage: config.icon,
                                maskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                maskSize: 'contain'
                              }}
                            />
                            <span className="font-montserrat text-sm font-normal leading-[1.46] text-[#f7f6f2]">
                              {config.text}
                            </span>
                          </div>
                          {status === tempStatus && (
                            <Check className="w-4 h-4 text-[#f7f6f2]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Priority Row */}
              <div className="relative">
                <div 
                  onClick={() => toggleDropdown('priority')}
                  className="rounded-[8px] p-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between px-[8px] py-[6px] h-8">
                    <div className="flex items-center gap-1 flex-1">
                      <div className="font-medium text-xs leading-[1.32] text-[#979795] flex-shrink-0 w-[108px] font-montserrat">
                        Priority
                      </div>
                      <div>
                        {(() => {
                          const tempPriorityConfig = getPriorityConfig(tempPriority);
                          const IconComponent = tempPriorityConfig.icon;
                          return (
                            <div 
                              className="flex items-center gap-1 px-2 py-0.5 rounded-[9999px]"
                              style={{ backgroundColor: tempPriorityConfig.bgColor }}
                            >
                              <IconComponent 
                                className="w-4 h-4 flex-shrink-0" 
                                style={{ color: tempPriorityConfig.iconColor, width: '16px', height: '16px' }}
                              />
                              <span 
                                className="text-xs font-medium whitespace-nowrap"
                                style={{ 
                                  color: tempPriorityConfig.iconColor,
                                  fontFamily: 'Montserrat',
                                  fontWeight: 500,
                                  fontSize: '12px',
                                  lineHeight: '1.32'
                                }}
                              >
                                {tempPriorityConfig.label}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Priority Dropdown */}
                {openDropdown === 'priority' && (
                  <div className="absolute top-full left-2 right-2 bg-[#292928] border border-[#3d3d3c] rounded-xl py-1 shadow-lg z-10 mt-1">
                    {(['high', 'medium', 'low'] as Task['priority'][]).map((priority) => {
                      const config = getPriorityConfig(priority);
                      const IconComponent = config.icon;
                      return (
                        <div
                          key={priority}
                          className="flex items-center justify-between px-3 py-2 h-9 cursor-pointer transition-colors duration-150 gap-2 hover:bg-[rgba(255,255,255,0.04)]"
                          onClick={() => {
                            setTempPriority(priority);
                            setOpenDropdown(null);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <IconComponent 
                              className="w-4 h-4 flex-shrink-0" 
                              style={{ color: config.iconColor }}
                            />
                            <span className="font-montserrat text-sm font-normal leading-[1.46] text-[#f7f6f2]">
                              {config.label}
                            </span>
                          </div>
                          {priority === tempPriority && (
                            <Check className="w-4 h-4 text-[#f7f6f2]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Deadline Row */}
              {deadlineText && (
                <div className="rounded-[8px] p-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between px-[8px] py-[6px] h-8">
                    <div className="flex items-center gap-1 flex-1">
                      <div className="font-medium text-xs leading-[1.32] text-[#979795] flex-shrink-0 w-[108px] font-montserrat">
                        Deadline
                      </div>
                      <div>
                        {(() => {
                          const deadlineColor = getDeadlineColor(task.deadline);
                          return deadlineColor ? (
                            <div 
                              className="flex gap-[4px] items-center justify-center px-[8px] py-[2px] rounded-[9999px]"
                              style={{ backgroundColor: deadlineColor.bg }}
                            >
                              <span 
                                className="font-montserrat text-[12px] font-medium leading-[1.32]"
                                style={{ color: deadlineColor.text }}
                              >
                                {deadlineText}
                              </span>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Type Row */}
              <div className="relative">
                <div 
                  onClick={() => toggleDropdown('type')}
                  className="rounded-[8px] p-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between px-[8px] py-[6px] h-8">
                    <div className="flex items-center gap-1 flex-1">
                      <div className="font-medium text-xs leading-[1.32] text-[#979795] flex-shrink-0 w-[108px] font-montserrat">
                        Type
                      </div>
                      <div>
                        <div className="backdrop-blur-[20px] backdrop-filter bg-[rgba(0,0,0,0.25)] flex gap-[4px] items-center justify-center px-[8px] py-[2px] rounded-[9999px]">
                          <span className="font-montserrat text-[12px] font-medium leading-[1.32] text-[#f7f6f2]">
                            {formatTaskType(tempType)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Type Dropdown */}
                {openDropdown === 'type' && (
                  <div className="absolute top-full left-2 right-2 bg-[#292928] border border-[#3d3d3c] rounded-xl py-1 shadow-lg z-10 mt-1">
                    {[
                      { value: 'generaltodo', label: 'General Task' },
                      { value: 'workoutPlanning', label: 'Workout Planning' },
                      { value: 'nutritionPlanning', label: 'Nutrition Planning' },
                      { value: 'performanceAnalysis', label: 'Performance Analysis' },
                      { value: 'injuryRehab', label: 'Injury Rehab' },
                      { value: 'competitionPrep', label: 'Competition Prep' }
                    ].map((typeOption) => (
                      <div
                        key={typeOption.value}
                        className="flex items-center justify-between px-3 py-2 h-9 cursor-pointer transition-colors duration-150 gap-2 hover:bg-[rgba(255,255,255,0.04)]"
                        onClick={() => {
                          setTempType(typeOption.value);
                          setOpenDropdown(null);
                        }}
                      >
                        <span className="font-montserrat text-sm font-normal leading-[1.46] text-[#f7f6f2]">
                          {typeOption.label}
                        </span>
                        {typeOption.value === tempType && (
                          <Check className="w-4 h-4 text-[#f7f6f2]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignee Row */}
              <div className="relative">
                <div 
                  onClick={() => toggleDropdown('assignee')}
                  className="rounded-[8px] p-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between px-[8px] py-[6px] h-8">
                    <div className="flex items-center gap-1 flex-1">
                      <div className="font-medium text-xs leading-[1.32] text-[#979795] flex-shrink-0 w-[108px] font-montserrat">
                        Assignee
                      </div>
                      <div>
                        {(() => {
                          const currentAssignee = users.find(u => u.id === tempAssigneeId);
                          return (
                            <div className="flex gap-[4px] items-center">
                              <div 
                                className="w-[20px] h-[20px] rounded-[9999px] bg-cover bg-center border border-[#292928]"
                                style={{ 
                                  backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=20&h=20&fit=crop&crop=face')"
                                }}
                              />
                              <span className="font-montserrat text-[12px] font-medium leading-[1.32] text-[#f7f6f2] overflow-ellipsis overflow-hidden text-nowrap">
                                {currentAssignee?.name || 'Unassigned'}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Assignee Dropdown */}
                {openDropdown === 'assignee' && (
                  <div className="absolute top-full left-2 right-2 bg-[#292928] border border-[#3d3d3c] rounded-xl py-1 shadow-lg z-10 mt-1">
                    <div
                      className="flex items-center justify-between px-3 py-2 h-9 cursor-pointer transition-colors duration-150 gap-2 hover:bg-[rgba(255,255,255,0.04)]"
                      onClick={() => {
                        setTempAssigneeId('');
                        setOpenDropdown(null);
                      }}
                    >
                      <span className="font-montserrat text-sm font-normal leading-[1.46] text-[#979795]">
                        Unassigned
                      </span>
                      {!tempAssigneeId && (
                        <Check className="w-4 h-4 text-[#f7f6f2]" />
                      )}
                    </div>
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between px-3 py-2 h-9 cursor-pointer transition-colors duration-150 gap-2 hover:bg-[rgba(255,255,255,0.04)]"
                        onClick={() => {
                          setTempAssigneeId(user.id);
                          setOpenDropdown(null);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-5 h-5 rounded-[9999px] bg-cover bg-center border border-[#292928]"
                            style={{ 
                              backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=20&h=20&fit=crop&crop=face')"
                            }}
                          />
                          <span className="font-montserrat text-sm font-normal leading-[1.46] text-[#f7f6f2]">
                            {user.name}
                          </span>
                        </div>
                        {user.id === tempAssigneeId && (
                          <Check className="w-4 h-4 text-[#f7f6f2]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleCloseBadgeModal}
                  className="flex-1 px-4 py-2 font-montserrat text-[14px] font-medium leading-[1.46] text-[#979795] hover:bg-[rgba(151,151,149,0.1)] rounded-[9999px] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBadgeChanges}
                  className="flex-1 px-4 py-2 bg-[#e5e4e1] hover:bg-[#d5d4d1] text-black font-montserrat text-[14px] font-medium leading-[1.46] rounded-[9999px] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
