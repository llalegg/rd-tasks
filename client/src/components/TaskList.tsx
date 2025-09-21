import { Task } from "@shared/schema";
import { prototypeTasks, getCoaches, getAthletes } from "@/data/prototypeData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, Edit, Trash2, Circle, Clock, AlertCircle, CheckCircle, GripVertical, MoreHorizontal, List, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import React from "react";
import DeadlineBadge from "./DeadlineBadge";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import UserAvatar from "./UserAvatar";
import { TypeBadge } from "@/components/ui/type-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";

// Helper function to format task types
const formatTaskType = (type: string | undefined) => {
  if (!type) return '';
  
  // Handle specific cases to replace "todo" with "task"
  if (type === 'generaltodo') return 'General Task';
  
  // Handle camelCase words by splitting on capital letters
  return type
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .replace(/\b\w/g, str => str.toUpperCase()) // Capitalize each word
    .replace(/\btodo\b/gi, 'Task'); // Replace "todo" with "Task" (case insensitive)
};

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusUpdate?: (taskId: string, newStatus: Task['status']) => void;
  onDeleteTask?: (taskId: string) => void;
  viewMode?: 'list' | 'cards';
  isMobile?: boolean;
}

type SortField = 'deadline' | 'type' | 'name' | 'status' | 'priority';
type SortDirection = 'asc' | 'desc';

// Priority Indicator Component - Icon Only for Table
const PriorityIndicator = ({ priority }: { priority: string }) => {
  return <PriorityBadge priority={priority as Task['priority']} />;
};

// Mobile Task Card Component
const MobileTaskCard = ({ task, users, athletes, onTaskClick }: { 
  task: Task; 
  users: any[]; 
  athletes: any[]; 
  onTaskClick: (task: Task) => void; 
}) => {
  const assignee = users.find((u: any) => u.id === task.assigneeId);
  const relatedAthletes = (task as any).relatedAthleteIds ? 
    (task as any).relatedAthleteIds.map((id: string) => athletes.find((a: any) => a.id === id)).filter(Boolean) : [];

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#f87171';
      case 'medium': return '#3f83f8';
      case 'low': return '#979795';
      default: return '#979795';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return '#ff8254';
      case 'in_progress': return '#3f83f8';
      case 'pending': return '#f87171';
      case 'completed': return '#4ade80';
      default: return '#ff8254';
    }
  };

  const formatDeadline = (deadline: string | Date | undefined) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
    if (diffDays <= 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      onClick={() => onTaskClick(task)}
      className="bg-[#1C1C1B] border border-[#292928] rounded-xl p-4 cursor-pointer hover:bg-[#2C2C2B] transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-3">
          <h3 className="text-[#F7F6F2] text-sm font-semibold leading-[1.46] mb-1 line-clamp-2">
            {task.name}
          </h3>
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getStatusColor(task.status) }}
            />
            <span className="text-xs text-[#979795] capitalize">
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        />
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Assignee & Athletes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {assignee ? (
              <div className="flex items-center gap-2">
                <UserAvatar userId={assignee.id} name={assignee.name} size="xs" />
                <span className="text-xs text-[#979795]">{assignee.name}</span>
              </div>
            ) : (
              <span className="text-xs text-[#979795]">Unassigned</span>
            )}
          </div>
          
          {relatedAthletes.length > 0 && (
            <div className="flex items-center">
              {relatedAthletes.slice(0, 3).map((athlete: any, index: number) => (
                <div
                  key={athlete?.id}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold text-white border border-black border-opacity-70 ${index > 0 ? '-ml-1' : ''}`}
                  style={{
                    backgroundColor: ['#4ade80', '#3b82f6', '#f59e0b'][index % 3]
                  }}
                >
                  {athlete?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </div>
              ))}
              {relatedAthletes.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-[#3d3d3c] flex items-center justify-center text-xs font-semibold text-[#979795] -ml-1">
                  +{relatedAthletes.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Deadline */}
        {task.deadline && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#979795]">Deadline</span>
            <span className="text-xs text-[#f7f6f2]">{formatDeadline(task.deadline)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
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
      case 'pending':
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

  const config = getStatusConfig();

  return (
    <span 
      className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ 
        backgroundColor: config.bgColor, 
        color: config.textColor,
        fontFamily: 'Montserrat',
        fontWeight: 500,
        fontSize: '12px',
        lineHeight: '1.32'
      }}
    >
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
      <span>{config.text}</span>
    </span>
  );
};

// Sortable Task Row Component
interface SortableTaskRowProps {
  task: Task;
  users: any[];
  athletes: any[];
  onTaskClick: (task: Task) => void;
  openDropdowns: {[key: string]: 'priority' | 'status' | 'deadline' | 'assignee' | null};
  onToggleDropdown: (taskId: string, type: 'priority' | 'status' | 'deadline' | 'assignee') => void;
  onUpdatePriority: (taskId: string, priority: 'low' | 'medium' | 'high') => void;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  onUpdateDeadline: (taskId: string, deadline: Date | null | undefined) => void;
  onUpdateAssignee: (taskId: string, assigneeId: string) => void;
}

function SortableTaskRow({ task, users, athletes, onTaskClick, openDropdowns, onToggleDropdown, onUpdatePriority, onUpdateStatus, onUpdateDeadline, onUpdateAssignee }: SortableTaskRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const assignee = users.find((u: any) => u.id === task.assigneeId);
  const relatedAthletes = (task as any).relatedAthleteIds ? 
    (task as any).relatedAthleteIds.map((id: string) => athletes.find((a: any) => a.id === id)).filter(Boolean) : [];

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        gridTemplateColumns: "40px 1fr 200px 196px 120px 88px 120px 140px"
      }}
      className={`grid items-center border-b border-[#292928] h-12 px-0 bg-[#1C1C1B] hover:bg-[#2C2C2B] transition-colors cursor-pointer ${
        isDragging ? 'z-50 shadow-2xl' : ''
      }`}
      onClick={() => onTaskClick(task)}
    >
      {/* Drag Handle */}
      <div className="flex items-center justify-center w-[40px]">
        <button
          {...attributes}
          {...listeners}
          className="text-[#979795] hover:text-[#f7f6f2] cursor-grab active:cursor-grabbing p-1 w-6 h-6 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Task Name */}
      <div className="flex items-center px-4 flex-1">
        <div className="font-semibold text-sm leading-[1.46] text-[#f7f6f2] overflow-hidden text-ellipsis whitespace-nowrap font-montserrat w-full">
          {task.name}
        </div>
      </div>

      {/* Type */}
      <div className="flex items-center px-4 w-[200px]">
        <TypeBadge type={task.type} />
      </div>

      {/* Related Athletes */}
      <div className="flex items-center px-4 w-[196px]">
        <div className="flex items-center">
          {relatedAthletes.length > 0 ? (
            <div className="flex">
              {relatedAthletes.slice(0, 4).map((athlete: any, avatarIndex: number) => (
                <div
                  key={athlete?.id}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white border border-black border-opacity-70 ${avatarIndex > 0 ? '-ml-2' : ''}`}
                  style={{
                    backgroundColor: ['#4ade80', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][avatarIndex % 5]
                  }}
                >
                  {athlete?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-[#979795] text-sm">–</span>
          )}
        </div>
      </div>

      {/* Assignee */}
      <div className="flex items-center px-4 w-[120px]">
        <DropdownMenu 
          open={openDropdowns[task.id] === 'assignee'} 
          onOpenChange={(open) => !open && onToggleDropdown(task.id, 'assignee')}
        >
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDropdown(task.id, 'assignee');
              }}
              className="hover:bg-[rgba(255,255,255,0.05)] rounded p-1 transition-colors flex items-center"
            >
              {assignee ? (
                <UserAvatar userId={assignee.id} name={assignee.name} size="xs" />
              ) : (
                <span className="text-[#979795] text-sm">Unassigned</span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#292928] border-[#3d3d3c]">
            {users.map((user: any) => (
              <DropdownMenuItem 
                key={user.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateAssignee(task.id, user.id);
                }}
                className="text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold text-white border border-black border-opacity-70"
                    style={{ backgroundColor: '#f59e0b' }}
                  >
                          {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                  {user.name}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onUpdateAssignee(task.id, '');
              }}
              className="text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer"
            >
              <span className="text-[#979795]">Unassigned</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Priority */}
      <div className="flex items-center px-4 w-[88px]">
        <DropdownMenu 
          open={openDropdowns[task.id] === 'priority'} 
          onOpenChange={(open) => !open && onToggleDropdown(task.id, 'priority')}
        >
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDropdown(task.id, 'priority');
              }}
              className="hover:bg-[rgba(255,255,255,0.05)] rounded p-1 transition-colors"
            >
              <PriorityIndicator priority={task.priority || 'medium'} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#292928] border-[#3d3d3c]">
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onUpdatePriority(task.id, 'high');
              }}
              className={`text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer ${
                task.priority === 'high' ? 'bg-[#3a3a38]' : ''
              }`}
            >
              High
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onUpdatePriority(task.id, 'medium');
              }}
              className={`text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer ${
                task.priority === 'medium' ? 'bg-[#3a3a38]' : ''
              }`}
            >
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onUpdatePriority(task.id, 'low');
              }}
              className={`text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer ${
                task.priority === 'low' ? 'bg-[#3a3a38]' : ''
              }`}
            >
              Low
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Deadline */}
      <div className="flex items-center px-4 w-[120px]">
        <div
          onClick={(e) => e.stopPropagation()}
        >
          <DatePicker
            value={task.deadline ? (task.deadline instanceof Date ? task.deadline : new Date(task.deadline)) : null}
            onChange={(date) => {
              onUpdateDeadline(task.id, date);
            }}
            placeholder="–"
            variant="badge"
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center px-4 w-[140px]">
        <DropdownMenu 
          open={openDropdowns[task.id] === 'status'} 
          onOpenChange={(open) => !open && onToggleDropdown(task.id, 'status')}
        >
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDropdown(task.id, 'status');
              }}
              className="hover:bg-[rgba(255,255,255,0.05)] rounded p-1 transition-colors"
            >
              <StatusBadge status={task.status} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#292928] border-[#3d3d3c]">
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(task.id, 'new');
              }}
              className={`text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer ${
                task.status === 'new' ? 'bg-[#3a3a38]' : ''
              }`}
            >
              New
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(task.id, 'in_progress');
              }}
              className={`text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer ${
                task.status === 'in_progress' ? 'bg-[#3a3a38]' : ''
              }`}
            >
              In progress
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(task.id, 'pending');
              }}
              className={`text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer ${
                task.status === 'pending' ? 'bg-[#3a3a38]' : ''
              }`}
            >
              Blocked
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(task.id, 'completed');
              }}
              className={`text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer ${
                task.status === 'completed' ? 'bg-[#3a3a38]' : ''
              }`}
            >
              Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function TaskList({ tasks, onTaskClick, onStatusUpdate, onDeleteTask, viewMode = 'list', isMobile = false }: TaskListProps) {
  const [sortField, setSortField] = useState<SortField>('deadline');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [orderedTasks, setOrderedTasks] = useState<Task[]>(tasks);
  const [isManualOrdering, setIsManualOrdering] = useState<boolean>(false);
  const [openDropdowns, setOpenDropdowns] = useState<{[key: string]: 'priority' | 'status' | 'deadline' | 'assignee' | null}>({});

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update ordered tasks when tasks change
  React.useEffect(() => {
    setOrderedTasks(tasks);
  }, [tasks]);

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      // Enable manual ordering and reset column sorting
      setIsManualOrdering(true);
      
      setOrderedTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Note: Send reorder request to backend
        console.log('Task reordered:', { 
          taskId: active.id, 
          fromIndex: oldIndex, 
          toIndex: newIndex,
          newOrder: newOrder.map(t => t.id)
        });
        
        return newOrder;
      });
    }
  };

  // Use prototype data
  const users = getCoaches(); // Coaches act as users/assignees
  const athletes = getAthletes(); // Athletes for task relationships

  // Simple update functions for prototype
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    // In prototype mode, just console log the update
    console.log('Task update:', taskId, updates);
  };


  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusVariant = (status: Task['status']) => {
    switch (status) {
      case 'new': return 'secondary';
      case 'in_progress': return 'default';
      case 'pending': return 'outline';
      case 'completed': return 'secondary';
      default: return 'secondary';
    }
  };

  // Inline update handlers
  const handleUpdatePriority = (taskId: string, priority: 'low' | 'medium' | 'high') => {
    updateTask(taskId, { priority });
    setOpenDropdowns(prev => ({ ...prev, [taskId]: null }));
  };

  const handleUpdateStatus = (taskId: string, status: Task['status']) => {
    updateTask(taskId, { status });
    setOpenDropdowns(prev => ({ ...prev, [taskId]: null }));
    if (onStatusUpdate) {
      onStatusUpdate(taskId, status);
    }
  };

  const handleUpdateDeadline = (taskId: string, deadline: Date | null | undefined) => {
    updateTask(taskId, { deadline });
    setOpenDropdowns(prev => ({ ...prev, [taskId]: null }));
  };

  const handleUpdateAssignee = (taskId: string, assigneeId: string) => {
    updateTask(taskId, { assigneeId });
    setOpenDropdowns(prev => ({ ...prev, [taskId]: null }));
  };

  const toggleDropdown = (taskId: string, type: 'priority' | 'status' | 'deadline' | 'assignee') => {
    setOpenDropdowns(prev => ({
      ...prev,
      [taskId]: prev[taskId] === type ? null : type
    }));
  };

  const handleSort = (field: SortField) => {
    // Reset manual ordering when using column sorting
    setIsManualOrdering(false);
    
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4 ml-1" /> : 
      <ArrowDown className="w-4 h-4 ml-1" />;
  };


  const sortedTasks = [...orderedTasks].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'deadline':
        aValue = a.deadline ? new Date(a.deadline).getTime() : 0;
        bValue = b.deadline ? new Date(b.deadline).getTime() : 0;
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'type':
        aValue = a.type?.toLowerCase() || '';
        bValue = b.type?.toLowerCase() || '';
        break;
      case 'status':
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      case 'priority':
        // Define priority order: high = 3, medium = 2, low = 1
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[a.priority?.toLowerCase() as keyof typeof priorityOrder] || 0;
        bValue = priorityOrder[b.priority?.toLowerCase() as keyof typeof priorityOrder] || 0;
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Mobile card view
  if (isMobile && viewMode === 'cards') {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(isManualOrdering ? orderedTasks : sortedTasks).map((task) => (
            <MobileTaskCard
              key={task.id}
              task={task}
              users={users}
              athletes={athletes}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-[#979795] text-sm mb-2">No tasks found</div>
            <div className="text-[#585856] text-xs">Create a new task to get started</div>
          </div>
        )}
      </div>
    );
  }

  // Desktop table view or mobile list view
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full">
        <div className={`bg-[#121210] rounded-2xl overflow-hidden w-full ${isMobile ? '' : 'max-w-[1320px]'}`}>
          {/* Table Header - Hidden on mobile list view */}
          {!isMobile && (
            <div className="table-header flex items-center justify-flex-start w-full h-10 bg-[#121210] text-[#bcbbb7] text-xs font-medium" style={{fontFamily: 'Montserrat', fontSize: '12px', fontWeight: 500, lineHeight: '132%'}}>
              {/* First cell with list icon */}
              <div className="cell cell-first flex items-center justify-center relative h-10 px-0 pl-3 w-10 min-w-10 bg-[#121210]">
                <div className="list-icon w-4 h-4 bg-[#585856]" style={{
                  mask: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 18 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='%23585856' stroke-width='1' d='M1 1h16M1 6h16M1 11h16'/%3E%3C/svg%3E\") no-repeat center",
                  maskSize: 'contain'
                }}></div>
                <div className="divider w-px h-5 bg-[#292928] flex-shrink-0 ml-2"></div>
              </div>
              
              {/* Task Name */}
              <div className="cell cell-name flex items-center justify-between flex-grow max-w-[720px] h-10 px-4 bg-[#121210] relative">
                <button 
                  onClick={() => handleSort('name')}
                  className="cell-content flex items-center gap-1 flex-grow hover:text-[#f7f6f2] transition-colors"
                >
                  <span className="cell-text whitespace-nowrap overflow-hidden text-ellipsis">Name</span>
                  {getSortIcon('name')}
                </button>
                <div className="divider w-px h-5 bg-[#292928] flex-shrink-0"></div>
              </div>
              
              {/* Type */}
              <div className="cell cell-type flex items-center justify-between w-[200px] max-w-[720px] h-10 px-4 bg-[#121210] relative">
                <button 
                  onClick={() => handleSort('type')}
                  className="cell-content flex items-center gap-1 flex-grow hover:text-[#f7f6f2] transition-colors"
                >
                  <span className="cell-text whitespace-nowrap overflow-hidden text-ellipsis">Type</span>
                  {getSortIcon('type')}
                </button>
                <div className="divider w-px h-5 bg-[#292928] flex-shrink-0"></div>
              </div>
              
              {/* Related Athletes */}
              <div className="cell cell-athlete flex items-center justify-between w-[196px] max-w-[720px] h-10 px-4 bg-[#121210] relative">
                <div className="cell-content flex items-center gap-1 flex-grow">
                  <span className="cell-text whitespace-nowrap overflow-hidden text-ellipsis">Related athlete(s)</span>
                </div>
                <div className="divider w-px h-5 bg-[#292928] flex-shrink-0"></div>
              </div>
              
              {/* Assignee */}
              <div className="cell cell-assignee flex items-center justify-between w-[120px] max-w-[720px] h-10 px-4 bg-[#121210] relative">
                <div className="cell-content flex items-center gap-1 flex-grow">
                  <span className="cell-text whitespace-nowrap overflow-hidden text-ellipsis">Assignee</span>
                </div>
                <div className="divider w-px h-5 bg-[#292928] flex-shrink-0"></div>
              </div>
              
              {/* Priority */}
              <div className="cell cell-priority flex items-center justify-between min-w-fit max-w-[720px] h-10 px-4 bg-[#121210] relative">
                <button 
                  onClick={() => handleSort('priority')}
                  className="cell-content flex items-center gap-1 flex-grow hover:text-[#f7f6f2] transition-colors"
                >
                  <span className="cell-text whitespace-nowrap overflow-hidden text-ellipsis">Priority</span>
                  {getSortIcon('priority')}
                </button>
                <div className="divider w-px h-5 bg-[#292928] flex-shrink-0"></div>
              </div>
              
              {/* Deadline */}
              <div className="cell cell-deadline flex items-center justify-between w-[120px] max-w-[720px] h-10 px-4 bg-[#121210] relative">
                <button 
                  onClick={() => handleSort('deadline')}
                  className="cell-content flex items-center gap-1 flex-grow hover:text-[#f7f6f2] transition-colors"
                >
                  <span className="cell-text whitespace-nowrap overflow-hidden text-ellipsis">Deadline</span>
                  {getSortIcon('deadline')}
                </button>
                <div className="divider w-px h-5 bg-[#292928] flex-shrink-0"></div>
              </div>
              
              {/* Status */}
              <div className="cell cell-status flex items-center justify-between w-[120px] max-w-[720px] h-10 px-4 bg-[#121210] relative">
                <button 
                  onClick={() => handleSort('status')}
                  className="cell-content flex items-center gap-1 flex-grow hover:text-[#f7f6f2] transition-colors"
                >
                  <span className="cell-text whitespace-nowrap overflow-hidden text-ellipsis">Status</span>
                  {getSortIcon('status')}
                </button>
              </div>
            </div>
          )}

          {/* Table Body */}
          <div>
            <SortableContext 
              items={isManualOrdering ? orderedTasks.map(t => t.id) : sortedTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {(isManualOrdering ? orderedTasks : sortedTasks).map((task) => (
                isMobile ? (
                  // Mobile simplified row
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="flex items-center justify-between p-4 border-b border-[#292928] bg-[#1C1C1B] hover:bg-[#2C2C2B] transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="text-[#F7F6F2] text-sm font-semibold mb-1">{task.name}</div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ 
                            backgroundColor: task.status === 'new' ? '#ff8254' : 
                                           task.status === 'in_progress' ? '#3f83f8' : 
                                           task.status === 'pending' ? '#f87171' : 
                                           task.status === 'completed' ? '#4ade80' : '#ff8254'
                          }}
                        />
                        <span className="text-xs text-[#979795] capitalize">
                          {task.status.replace('_', ' ')}
                        </span>
                        {task.deadline && (
                          <>
                            <span className="text-xs text-[#585856]">•</span>
                            <span className="text-xs text-[#979795]">
                              {(() => {
                                const date = new Date(task.deadline);
                                const today = new Date();
                                const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                
                                if (diffDays === 0) return 'Today';
                                if (diffDays === 1) return 'Tomorrow';
                                if (diffDays === -1) return 'Yesterday';
                                if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
                                if (diffDays <= 7) return `${diffDays}d`;
                                
                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                              })()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const assignee = users.find((u: any) => u.id === task.assigneeId);
                        return assignee ? (
                          <UserAvatar userId={assignee.id} name={assignee.name} size="xs" />
                        ) : null;
                      })()}
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ 
                          backgroundColor: task.priority === 'high' ? '#f87171' : 
                                         task.priority === 'medium' ? '#3f83f8' : '#979795'
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <SortableTaskRow
                    key={task.id}
                    task={task}
                    users={users}
                    athletes={athletes}
                    onTaskClick={onTaskClick}
                    openDropdowns={openDropdowns}
                    onToggleDropdown={toggleDropdown}
                    onUpdatePriority={handleUpdatePriority}
                    onUpdateStatus={handleUpdateStatus}
                    onUpdateDeadline={handleUpdateDeadline}
                    onUpdateAssignee={handleUpdateAssignee}
                  />
                )
              ))}
            </SortableContext>
          </div>
        </div>
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-[#979795] text-sm mb-2">No tasks found</div>
            <div className="text-[#585856] text-xs">Create a new task to get started</div>
          </div>
        )}
      </div>
    </DndContext>
  );
}
