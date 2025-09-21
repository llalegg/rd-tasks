import React, { useState, useEffect } from "react";
import { Task } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Send, Edit3, Check, Trash2, Search, Paperclip, Circle, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCoaches, getAthletes, getPerson } from "@/data/prototypeData";
import { InteractiveRow } from "@/components/ui/interactive-row";
import { TypeBadge } from "@/components/ui/type-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { DatePicker } from "@/components/ui/date-picker";
import UserAvatar from "./UserAvatar";

interface TaskViewModalProps {
  task: Task | null;
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
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [localTask, setLocalTask] = useState<Task | null>(null);
  
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Use prototype data
  const users = getCoaches();
  const athletes = getAthletes();

  // Handle clicking outside athlete dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAthleteDropdown) {
        const target = event.target as Element;
        const dropdown = document.querySelector('[data-athlete-dropdown]');
        if (dropdown && !dropdown.contains(target)) {
          setShowAthleteDropdown(false);
        }
      }
    };

    if (showAthleteDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAthleteDropdown]);

  // Sync task prop with local state
  useEffect(() => {
    setLocalTask(task);
    if (task) {
      setEditedTitle(task.name);
      setEditedDescription(task.description || '');
      
      // Initialize comments - only add mock comments for existing tasks, not new ones
      if (task.name === 'New Task' && task.description === 'Task description') {
        // This is a newly created task - start with no comments
        setComments([]);
      } else {
        // This is an existing task - add some mock comments
        setComments([
          {
            id: '1',
            text: 'This task looks good to me, let me know when you need review.',
            authorId: 'coach1',
            authorName: 'John Withington',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            text: 'Working on this now, should be done by EOD.',
            authorId: 'coach2',
            authorName: 'Sarah Johnson',
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } else {
      // No task - reset comments and history
      setComments([]);
      setHistory([]);
    }

    if (task) {
      setHistory([
        {
          id: '1',
          action: 'Task created',
          userId: task.creatorId || 'coach1',
          userName: 'John Withington',
          createdAt: new Date(task.createdAt).toISOString()
        },
        {
          id: '2',
          action: 'Status changed',
          field: 'status',
          oldValue: 'new',
          newValue: task.status,
          userId: task.assigneeId || 'coach1',
          userName: 'Sarah Johnson',
          createdAt: new Date(task.updatedAt || task.createdAt).toISOString()
        }
      ]);
    }
  }, [task]);

  if (!localTask) return null;

  const assignee = getPerson(localTask.assigneeId || '');
  const creator = getPerson(localTask.creatorId || '');
  const relatedAthletes = localTask.relatedAthleteIds?.map(id => getPerson(id)).filter(Boolean) || [];

  const handleSaveTitle = () => {
      setIsEditingTitle(false);
    if (editedTitle.trim() !== localTask.name) {
      toast({
        title: "Success",
        description: "Task title updated successfully"
      });
    }
  };

  const handleSaveDescription = () => {
      setIsEditingDescription(false);
    if (editedDescription !== (localTask.description || '')) {
      toast({
        title: "Success", 
        description: "Task description updated successfully"
      });
    }
  };

  const handleCancelEdit = (field: 'title' | 'description') => {
    if (field === 'title') {
      setEditedTitle(localTask.name);
      setIsEditingTitle(false);
    } else {
      setEditedDescription(localTask.description || '');
      setIsEditingDescription(false);
    }
  };

  const handleStatusChange = (newStatus: Task['status']) => {
    if (onStatusUpdate) {
      onStatusUpdate(localTask.id, newStatus);
    }
  };

  const handlePriorityChange = (newPriority: string) => {
    toast({
      title: "Success",
      description: `Priority changed to ${newPriority}`
    });
  };

  const handleDeleteTask = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (localTask) {
      onDeleteTask?.(localTask.id);
      onClose();
    }
    setShowDeleteConfirmation(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const hasUnsavedChanges = () => {
    if (!localTask) return false;
    return isEditingTitle || isEditingDescription || 
           (localTask.name !== editedTitle) || 
           (localTask.description !== editedDescription);
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedChangesDialog(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setShowUnsavedChangesDialog(false);
    onClose();
  };

  const cancelClose = () => {
    setShowUnsavedChangesDialog(false);
  };

  const handleAssigneeChange = (newAssigneeId: string) => {
    const assignee = getPerson(newAssigneeId);
    toast({
      title: "Success",
      description: `Task assigned to ${assignee?.name || 'Unassigned'}`
    });
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      text: commentText.trim(),
      authorId: 'coach1',
      authorName: 'Current User',
      createdAt: new Date().toISOString()
    };
    
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
    
    toast({
      title: "Success",
      description: "Comment added"
    });
  };

  const handleAddAthlete = (athleteId: string) => {
    const athlete = getPerson(athleteId);
    if (athlete && !localTask.relatedAthleteIds?.includes(athleteId)) {
      toast({
        title: "Success",
        description: `${athlete.name} added to task`
      });
    }
    setShowAthleteDropdown(false);
    setAthleteSearchQuery('');
  };

  const handleRemoveAthlete = (athleteId: string) => {
    const athlete = getPerson(athleteId);
    toast({
      title: "Success",
      description: `${athlete?.name} removed from task`
    });
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

  // Figma-style badge components
  const getStatusBadge = (status: Task['status']) => {
    const statusConfig = {
      'new': { bg: '#31180f', color: '#ff8254', label: 'New' },
      'in_progress': { bg: '#1a2e42', color: '#3b82f6', label: 'In Progress' },
      'blocked': { bg: '#2d1b42', color: '#8b5cf6', label: 'Blocked' },
      'completed': { bg: '#1a2e1a', color: '#22c55e', label: 'Completed' }
    };
    
    const config = statusConfig[status] || statusConfig.new;

    return (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: config.bg }}>
        <Circle className="w-4 h-4" style={{ color: config.color }} />
        <span className="text-xs font-medium" style={{ color: config.color }}>{config.label}</span>
      </div>
    );
  };

  const getPriorityBadge = (priority: string) => {
    return <PriorityBadge priority={priority as Task['priority']} />;
  };

  const getTypeBadge = (type: string) => {
    return <TypeBadge type={type} />;
  };

  const getDeadlineBadge = (deadline: string | Date | null) => {
    if (!deadline) {
      return <span className="text-xs font-normal text-[#979795]">No deadline</span>;
    }
    
    return (
      <div className="bg-[#321a1a] px-2 py-0.5 rounded-full">
        <span className="text-xs font-medium text-red-400">5 d ago</span>
      </div>
    );
  };

  const filteredAthletes = athletes.filter(athlete =>
    athlete.name.toLowerCase().includes(athleteSearchQuery.toLowerCase()) &&
    !localTask.relatedAthleteIds?.includes(athlete.id)
  );

  // Mobile rendering
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="h-[90vh] bg-[#1c1c1b] border-none font-montserrat">
          <SheetHeader>
            <SheetTitle className="sr-only">Task Details</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#f7f6f2]">{localTask.name}</h2>
                <p className="text-sm text-[#979795]">{localTask.description}</p>
                <div className="flex gap-2">
                  <StatusBadge status={localTask.status} />
                  <PriorityBadge priority={localTask.priority} />
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop rendering with original two-column layout
  return (
    <Dialog open={isOpen && !!task} onOpenChange={(open) => !open && onClose()}>
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
                        onClick={() => {}}
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
                  <div className="border border-[#3d3d3c] rounded-lg">
                    <div className="p-3 pb-2">
                    <input
                      type="text"
                        className="bg-transparent border-none outline-none text-[#f7f6f2] text-sm font-montserrat w-full py-2 placeholder-[#585856]"
                      placeholder="Write a comment"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && commentText.trim() && handleSendComment()}
                    />
                    </div>
                    <div className="flex items-center justify-between px-3 pb-2">
                      <button className="w-8 h-8 rounded-full border-none bg-[#292928] flex items-center justify-center cursor-pointer hover:bg-[#3a3a38] transition-colors">
                        <Plus className="w-4 h-4 text-[#f7f6f2]" />
                      </button>
                      <button
                        onClick={handleSendComment}
                        disabled={!commentText.trim()}
                        className={`w-8 h-8 rounded-full border-none flex items-center justify-center transition-colors ${
                          commentText.trim() 
                            ? 'bg-[#e5e4e1] hover:bg-[#d5d4d1] cursor-pointer' 
                            : 'bg-[#322e21] cursor-not-allowed'
                        }`}
                      >
                        <Send className={`w-4 h-4 ${commentText.trim() ? 'text-black' : 'text-black'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="flex flex-col gap-2">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-[#292928] rounded-xl px-3 py-2 max-w-[600px]">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-[#4ade80] flex items-center justify-center text-xs font-semibold text-white">
                            {comment.authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div className="text-xs font-medium text-[#f7f6f2]">{comment.authorName}</div>
                          <div className="text-[10px] text-[#979795] ml-auto">{formatDateTime(comment.createdAt)}</div>
                        </div>
                        <div className="text-sm text-[#f7f6f2] leading-relaxed">{comment.text}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* History Tab */
                <div className="flex flex-col gap-2">
                  {history.map((entry) => (
                    <div key={entry.id} className="bg-[#292928] rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-[#3b82f6] flex items-center justify-center text-xs font-semibold text-white">
                          {entry.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="text-xs font-medium text-[#f7f6f2]">{entry.userName}</div>
                        <div className="text-[10px] text-[#979795] ml-auto">{formatDateTime(entry.createdAt)}</div>
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

          {/* Right Sidebar - Metadata */}
          <div className="w-80 bg-[#171716] overflow-y-auto">
            <div className="p-4">
              {/* Header with Delete/Close buttons */}
              <div className="flex items-center justify-end gap-1 mb-4 h-[40px]">
                <Button
                  variant="ghost"
                  size="sm"
                      onClick={handleDeleteTask}
                  className="h-8 w-8 p-0 text-[#979795] hover:bg-[rgba(151,151,149,0.1)] hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0 text-[#979795] hover:bg-[rgba(151,151,149,0.1)]"
                >
                  <X className="w-4 h-4" />
                </Button>
            </div>

              {/* Metadata */}
              <div className="space-y-1">
                {/* Status */}
                <InteractiveRow
                  label="Status"
                  value={localTask.status}
                  badge={getStatusBadge(localTask.status)}
                  options={[
                    { value: 'new', label: 'New' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'blocked', label: 'Blocked' },
                    { value: 'completed', label: 'Completed' }
                  ]}
                  onValueChange={handleStatusChange}
                />

                {/* Priority */}
                <InteractiveRow
                  label="Priority"
                  value={localTask.priority}
                  badge={getPriorityBadge(localTask.priority)}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' }
                  ]}
                  onValueChange={handlePriorityChange}
                />

                {/* Deadline */}
                <InteractiveRow
                  label="Deadline"
                  value={localTask.deadline ? localTask.deadline.toString() : 'no-deadline'}
                  badge={getDeadlineBadge(localTask.deadline)}
                  badgeClickable={true}
                  onBadgeClick={() => setShowDeadlinePicker(!showDeadlinePicker)}
                />

                {/* Date Picker */}
                {showDeadlinePicker && (
                  <div className="relative">
                    <DatePicker
                      value={localTask.deadline ? (localTask.deadline instanceof Date ? localTask.deadline : new Date(localTask.deadline)) : null}
                      onChange={(date) => {
                        setLocalTask(prev => prev ? { ...prev, deadline: date } : null);
                        setShowDeadlinePicker(false);
                      }}
                      placeholder="Select deadline"
                    />
                  </div>
                )}

                {/* Type */}
                <InteractiveRow
                  label="Type"
                  value={localTask.type}
                  badge={getTypeBadge(localTask.type)}
                  disabled={true}
                />

                {/* Assignee */}
                <InteractiveRow
                  label="Assignee"
                  value={localTask.assigneeId || 'unassigned'}
                  badge={
                    assignee ? (
                      <div className="flex items-center gap-1">
                        <UserAvatar userId={assignee.id} name={assignee.name} size="xs" />
                        <div className="text-xs font-medium text-[#f7f6f2] overflow-hidden text-ellipsis whitespace-nowrap">{assignee.name}</div>
                      </div>
                    ) : (
                      <div className="text-xs font-normal text-[#979795]">Unassigned</div>
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
                    <div className="text-xs font-normal text-[#f7f6f2]">
                      Jul 20
                    </div>
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
                        <div className="text-xs font-medium text-[#f7f6f2] overflow-hidden text-ellipsis whitespace-nowrap">{creator.name}</div>
                      </div>
                    ) : (
                      <div className="text-xs font-normal text-[#979795]">Unknown</div>
                    )
                  }
                  disabled={true}
                />
              </div>

              <div className="flex items-center py-2 my-2">
                <div className="flex-1 h-px bg-[#292928]"></div>
            </div>

            {/* Related Athletes */}
            <div className="flex flex-col gap-1 relative">
              <div className="flex items-center justify-between h-8">
                  <div className="text-sm font-semibold text-[#f7f6f2]">Related athletes</div>
                <button 
                  onClick={() => setShowAthleteDropdown(!showAthleteDropdown)}
                  className="w-8 h-8 bg-transparent border-none rounded-full cursor-pointer flex items-center justify-center text-[#f7f6f2] hover:bg-[rgba(247,246,242,0.1)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Athlete Search Dropdown */}
              {showAthleteDropdown && (
                  <div data-athlete-dropdown className="absolute top-10 right-0 bg-[#1c1c1b] border border-[#3d3d3c] rounded-lg shadow-lg z-50 w-64">
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Search className="w-4 h-4 text-[#979795]" />
                      <Input
                        type="text"
                        placeholder="Search athletes..."
                        value={athleteSearchQuery}
                        onChange={(e) => setAthleteSearchQuery(e.target.value)}
                          className="bg-[#292928] border-[#3d3d3c] text-[#f7f6f2] text-sm flex-1"
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
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                              style={{
                                backgroundColor: ['#4ade80', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
                              }}
                            >
                              {athlete.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                              <div className="flex flex-col flex-1">
                                <div className="text-xs font-medium text-[#f7f6f2]">{athlete.name}</div>
                                <div className="text-[10px] text-[#979795]">
                                  {athlete.position} • {athlete.team || 'No team'}
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

                {/* Athletes List */}
              <div className="flex flex-col gap-0">
                  {/* Sample Athletes from Figma */}
                  <div className="bg-[#1c1c1b] flex gap-[12px] items-center px-[8px] py-0 rounded-[8px] hover:bg-[#2c2c2b] transition-colors">
                    <div className="flex gap-[8px] items-center flex-1">
                      <div className="w-8 h-8 rounded-full bg-center bg-cover border border-black/70 shrink-0" 
                           style={{backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face)'}}>
                      </div>
                      <div className="flex flex-col gap-[2px] flex-1">
                        <div className="font-['Montserrat:Medium',_sans-serif] leading-[0] overflow-ellipsis overflow-hidden text-[#f7f6f2] text-[12px] text-nowrap">
                          <p className="leading-[1.32] overflow-ellipsis overflow-hidden whitespace-pre">Christopher Harris</p>
                        </div>
                        <div className="font-['Montserrat:Regular',_sans-serif] leading-[0] overflow-ellipsis overflow-hidden text-[#979795] text-[10px] text-nowrap">
                          <p className="leading-[1.2] overflow-ellipsis overflow-hidden">Athlete</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-[12px] items-center shrink-0">
                      <div className="flex items-center justify-center rounded-[9999px] size-[32px] hover:bg-[#3d3d3c] transition-colors cursor-pointer">
                        <X className="w-4 h-4 text-[#f7f6f2]" />
                      </div>
                      <div className="bg-[#3d3d3c] flex items-center justify-center p-[6px] rounded-[9999px] size-[32px] hover:bg-[#4a4a48] transition-colors cursor-pointer">
                        <ChevronRight className="w-4 h-4 text-[#f7f6f2]" />
                      </div>
                    </div>
                  </div>
                    
                  <div className="bg-[#1c1c1b] flex gap-[12px] items-center px-[8px] py-0 rounded-[8px] hover:bg-[#2c2c2b] transition-colors">
                    <div className="flex gap-[8px] items-center flex-1">
                      <div className="w-8 h-8 rounded-full bg-center bg-cover border border-black/70 shrink-0" 
                           style={{backgroundImage: 'url(https://images.unsplash.com/photo-1494790108755-2616c6d6d55a?w=32&h=32&fit=crop&crop=face)'}}>
                      </div>
                      <div className="flex flex-col gap-[2px] flex-1">
                        <div className="font-['Montserrat:Medium',_sans-serif] leading-[0] overflow-ellipsis overflow-hidden text-[#f7f6f2] text-[12px] text-nowrap">
                          <p className="leading-[1.32] overflow-ellipsis overflow-hidden whitespace-pre">Samanta Harris</p>
                        </div>
                        <div className="font-['Montserrat:Regular',_sans-serif] leading-[0] overflow-ellipsis overflow-hidden text-[#979795] text-[10px] text-nowrap">
                          <p className="leading-[1.2] overflow-ellipsis overflow-hidden">Athlete</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-[12px] items-center shrink-0">
                      <div className="flex items-center justify-center rounded-[9999px] size-[32px] hover:bg-[#3d3d3c] transition-colors cursor-pointer">
                        <X className="w-4 h-4 text-[#f7f6f2]" />
                      </div>
                      <div className="bg-[#3d3d3c] flex items-center justify-center p-[6px] rounded-[9999px] size-[32px] hover:bg-[#4a4a48] transition-colors cursor-pointer">
                        <ChevronRight className="w-4 h-4 text-[#f7f6f2]" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1c1c1b] flex gap-[12px] items-center px-[8px] py-0 rounded-[8px] hover:bg-[#2c2c2b] transition-colors">
                    <div className="flex gap-[8px] items-center flex-1">
                      <div className="w-8 h-8 rounded-full bg-center bg-cover border border-black/70 shrink-0" 
                           style={{backgroundImage: 'url(https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face)'}}>
                      </div>
                      <div className="flex flex-col gap-[2px] flex-1">
                        <div className="font-['Montserrat:Medium',_sans-serif] leading-[0] overflow-ellipsis overflow-hidden text-[#f7f6f2] text-[12px] text-nowrap">
                          <p className="leading-[1.32] overflow-ellipsis overflow-hidden whitespace-pre">Randy Harris</p>
                        </div>
                        <div className="font-['Montserrat:Regular',_sans-serif] leading-[0] overflow-ellipsis overflow-hidden text-[#979795] text-[10px] text-nowrap">
                          <p className="leading-[1.2] overflow-ellipsis overflow-hidden">Athlete</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-[12px] items-center shrink-0">
                      <div className="flex items-center justify-center rounded-[9999px] size-[32px] hover:bg-[#3d3d3c] transition-colors cursor-pointer">
                        <X className="w-4 h-4 text-[#f7f6f2]" />
                      </div>
                      <div className="bg-[#3d3d3c] flex items-center justify-center p-[6px] rounded-[9999px] size-[32px] hover:bg-[#4a4a48] transition-colors cursor-pointer">
                        <ChevronRight className="w-4 h-4 text-[#f7f6f2]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
          <DialogContent className="max-w-md bg-[#1c1c1b] border-[#3d3d3c]">
            <DialogTitle className="text-lg font-semibold text-[#f7f6f2] mb-4">
              Delete Task
            </DialogTitle>
            <p className="text-sm text-[#979795] mb-6">
              Are you sure you want to delete "{localTask?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={cancelDelete}
                className="text-[#979795] hover:text-[#f7f6f2]"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
        </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Unsaved Changes Dialog */}
      {showUnsavedChangesDialog && (
        <Dialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
          <DialogContent className="max-w-md bg-[#1c1c1b] border-[#3d3d3c]">
            <DialogTitle className="text-lg font-semibold text-[#f7f6f2] mb-4">
              Unsaved Changes
            </DialogTitle>
            <p className="text-sm text-[#979795] mb-6">
              You have unsaved changes. Are you sure you want to close without saving?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={cancelClose}
                className="text-[#979795] hover:text-[#f7f6f2]"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmClose}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Close Without Saving
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
