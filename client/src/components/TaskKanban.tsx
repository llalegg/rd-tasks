import { Task } from "@shared/schema";
import { mockUsers, mockAthletes } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Tag, User, Users, MoreHorizontal, Edit, Trash2, CheckCircle, Clock, AlertCircle, Circle, Plus, X } from "lucide-react";
import { DotsThreeVertical, PencilSimple, Trash } from "@phosphor-icons/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import DeadlineBadge from "./DeadlineBadge";
import UserAvatar from "./UserAvatar";
import PriorityIcon from "./PriorityIcon";
import TaskDetails from "./TaskDetails";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCorners,
  rectIntersection,
  DragMoveEvent,
  pointerWithin,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface TaskKanbanProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  onTaskReorder?: (reorderedTasks: Task[]) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onCreateTask?: (status: Task['status']) => void;
}

// Sortable Task Card Component
interface SortableTaskCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
}

function SortableTaskCard({ task, onTaskClick, onEditTask, onDeleteTask, onStatusChange }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ 
    id: task.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 150ms cubic-bezier(0.25, 1, 0.5, 1)',
  };

  const assignee = mockUsers.find(u => u.id === task.assigneeId);
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

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'new': return Circle;
      case 'in_progress': return Clock;
      case 'blocked': return AlertCircle;
      case 'completed': return CheckCircle;
      default: return Circle;
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'new': return 'New';
      case 'in_progress': return 'In Progress';
      case 'blocked': return 'Blocked';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <Card 
      ref={setNodeRef}
      style={{
        ...style,
        borderRadius: 'var(--rounded-16-card)',
        background: 'var(--background-01)',
      }}
      {...attributes}
      {...listeners}
      className={`cursor-pointer hover:bg-[#333333] border-none shadow-sm hover:shadow-md hover:shadow-primary/20 hover:outline hover:outline-2 hover:outline-white hover:outline-offset-0 transition-all duration-200 group card-hover ${
        isDragging ? 'opacity-60 rotate-1 scale-102 shadow-lg z-50' : 'hover:-translate-y-0.5'
      }`}
      onClick={() => onTaskClick(task)}
    >
      <CardContent className="p-3 md:p-4 touch-manipulation">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-sm font-medium text-foreground line-clamp-2 flex-1 pr-2">
            {task.name}
          </h4>
          <div className="flex items-center gap-1 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 md:h-6 md:w-6 p-0 opacity-0 group-hover:opacity-70 hover:opacity-100 touch-manipulation rounded-[9999px] hover:bg-accent hover:text-accent-foreground transition-opacity duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DotsThreeVertical className="h-4 w-4 md:h-3 md:w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEditTask?.(task);
                }}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask?.(task.id);
                }}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        

        
        <div className="space-y-2 relative">
          <div className="flex items-center text-xs text-muted-foreground">
            {formatTaskType(task.type)}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Priority Icon */}
              <PriorityIcon priority={task.priority} size="sm" />
              
              {/* Deadline next to Priority */}
              <DeadlineBadge deadline={task.deadline} className="text-xs" />
              
              {/* Related Athletes */}
              {relatedAthletes.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <div className="flex -space-x-1">
                    {relatedAthletes.length === 1 ? (
                      <UserAvatar
                        key={relatedAthletes[0]!.id}
                        userId={relatedAthletes[0]!.id}
                        name={relatedAthletes[0]!.name}
                        size="xs"
                      />
                    ) : (
                      <>
                        <UserAvatar
                          key={relatedAthletes[0]!.id}
                          userId={relatedAthletes[0]!.id}
                          name={relatedAthletes[0]!.name}
                          size="xs"
                        />
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-white/20">
                          +{relatedAthletes.length - 1}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div></div>
          </div>
          
          {/* Assignee Avatar - Bottom Right Corner */}
          {assignee && (
            <div className="absolute bottom-0 right-0">
              <UserAvatar
                userId={assignee.id}
                name={assignee.name}
                size="xs"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Droppable Column Component
interface DroppableColumnProps {
  column: { key: string; title: string; color: string };
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  onCreateTask?: (status: Task['status']) => void;
  activeTaskId?: string | null;
  dragOverTaskId?: string | null;
  dragOverColumnId?: string | null;
}

function DroppableColumn({ column, tasks, onTaskClick, onEditTask, onDeleteTask, onStatusChange, onCreateTask, activeTaskId, dragOverTaskId, dragOverColumnId }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.key,
  });

  return (
    <Card 
      className={`flex-shrink-0 w-full md:min-w-[280px] md:w-80 h-fit ${
        isOver || dragOverColumnId === column.key ? column.solidColor : column.color
      } border-none transition-all duration-200 kanban-column`}
    >
      <CardHeader 
        className="pb-2 md:pb-3 px-3 pt-3"
      >
        <CardTitle className="text-white text-sm md:text-sm font-medium flex items-center gap-2">
          <span className="text-white/90">{column.title}</span>
          <span className="text-white/50 text-xs font-normal">({tasks.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 md:space-y-3 min-h-[200px] md:min-h-[400px] p-2 relative transition-all duration-200" ref={setNodeRef}>
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task, index) => {
            const isHoveringAbove = activeTaskId && dragOverTaskId === task.id;
            const draggedTaskIndex = activeTaskId ? tasks.findIndex(t => t.id === activeTaskId) : -1;
            const currentTaskIndex = index;
            const dragOverIndex = dragOverTaskId ? tasks.findIndex(t => t.id === dragOverTaskId) : -1;
            
            // Tasks that should be pushed down are those after the drop position
            const shouldPushDown = activeTaskId && dragOverTaskId && 
              dragOverIndex >= 0 && 
              currentTaskIndex >= dragOverIndex &&
              dragOverTaskId !== task.id &&
              activeTaskId !== task.id;
            
            return (
              <div key={task.id} className="relative">
                {/* Simple drop zone indicator */}
                {isHoveringAbove && (
                  <div className="h-2 mb-2 bg-primary/40 rounded-sm transition-all duration-150"></div>
                )}
                
                <div className={`transition-all duration-150 ease-out ${
                  shouldPushDown ? 'translate-y-4' : ''
                } ${activeTaskId === task.id ? 'opacity-50' : ''}`}>
                  <SortableTaskCard
                    task={task}
                    onTaskClick={onTaskClick}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                    onStatusChange={onStatusChange}
                  />
                </div>
              </div>
            );
          })}
          
          {/* Bottom drop zone for empty space at end of column */}
          {activeTaskId && isOver && dragOverColumnId === column.key && !dragOverTaskId && (
            <div className="h-2 bg-primary/40 rounded-sm transition-all duration-150"></div>
          )}
        </SortableContext>
        
        {/* Drop zone indicator for empty columns */}
        {tasks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-white/60 transition-all duration-200">
            <div className="text-center">
              <p className="text-sm font-medium opacity-70">Drop tasks here</p>
            </div>
          </div>
        )}
        

        
        {/* Add task button at bottom left */}
        <div className="absolute bottom-3 left-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCreateTask?.(column.key as Task['status'])}
            className="h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/10 rounded-[9999px] transition-colors"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TaskKanban({ tasks, onTaskClick, onTaskStatusChange, onTaskReorder, onEditTask, onDeleteTask, onCreateTask }: TaskKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [sortBy, setSortBy] = useState<'priority' | 'deadline'>('priority');

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleEditTask = (task: Task) => {
    handleModalClose();
    onEditTask?.(task);
  };
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = [
    { key: 'new', title: 'To-Do', color: 'bg-[#31180FA3]', solidColor: 'bg-[#31180F]' },
    { key: 'in_progress', title: 'In Progress', color: 'bg-[#162949A3]', solidColor: 'bg-[#162949]' },
    { key: 'blocked', title: 'Pending', color: 'bg-[#302608A3]', solidColor: 'bg-[#302608]' },
    { key: 'completed', title: 'Completed', color: 'bg-[#072A15A3]', solidColor: 'bg-[#072A15]' }
  ];

  // Sort tasks within each column
  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else {
        const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        return aDeadline - bDeadline;
      }
    });
  };

  const handleDragStart = (event: DragStartEvent) => {

    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event;
    
    if (!over || !active) {
      setDragOverTaskId(null);
      setDragOverColumnId(null);
      return;
    }
    
    const overId = over.id as string;
    const activeId = active.id as string;
    
    // Prevent dropping on self
    if (overId === activeId) {
      setDragOverTaskId(null);
      setDragOverColumnId(null);
      return;
    }
    
    // Check if we're over a task
    const overTask = tasks.find(task => task.id === overId);
    if (overTask) {
      setDragOverTaskId(overId);
      setDragOverColumnId(overTask.status);
      return;
    }
    
    // Check if we're over a column
    const columnStatuses = columns.map(col => col.key);
    if (columnStatuses.includes(overId)) {
      setDragOverColumnId(overId);
      setDragOverTaskId(null);
      return;
    }
    
    // Reset if not over anything relevant
    setDragOverTaskId(null);
    setDragOverColumnId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset state
    setActiveId(null);
    setDragOverTaskId(null);
    setDragOverColumnId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Get the task that was dragged
    const draggedTask = tasks.find(task => task.id === activeId);
    if (!draggedTask) return;



    // Check if we're dropping over a column
    const columnStatuses = columns.map(col => col.key);

    
    if (columnStatuses.includes(overId)) {
      // Dropping over a column - change status
      if (overId !== draggedTask.status) {

        if (onTaskStatusChange) {
          onTaskStatusChange(activeId, overId as Task['status']);
        }
      }
      return;
    }

    // Dropping over another task - check which column it belongs to
    const overTask = tasks.find(task => task.id === overId);
    if (overTask && draggedTask.status !== overTask.status) {
      console.log('Changing status from', draggedTask.status, 'to', overTask.status);
      console.log('onTaskStatusChange function exists:', !!onTaskStatusChange);
      if (onTaskStatusChange) {
        onTaskStatusChange(activeId, overTask.status);
      }
    }
  };

  const activeTask = activeId ? tasks.find(task => task.id === activeId) : null;

  const formatTaskType = (type: string) => {
    return type.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-4 md:space-y-6 h-full bg-gradient-to-br from-background to-muted/30 kanban-container">
      

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:overflow-x-auto pb-4 min-h-[400px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {columns.map((column) => {
            const columnTasks = tasks.filter(task => task.status === column.key);
            const sortedTasks = sortTasks(columnTasks);
            
            return (
              <DroppableColumn
                key={column.key}
                column={column}
                tasks={sortedTasks}
                onTaskClick={handleTaskClick}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onStatusChange={onTaskStatusChange}
                onCreateTask={onCreateTask}
                activeTaskId={activeId}
                dragOverTaskId={dragOverTaskId}
                dragOverColumnId={dragOverColumnId}
              />
            );
          })}
        </div>
        
        <DragOverlay dropAnimation={{
          duration: 500,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeTask ? (
            <Card className="cursor-grabbing border-none shadow-2xl rotate-3 scale-110 opacity-95" style={{ borderRadius: 'var(--rounded-16-card)', background: 'var(--background-01)' }}>
              <CardContent className="p-4">
                <div className="space-y-2 relative">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-sm leading-tight pr-2 text-white">{activeTask.name}</h3>
                  </div>
                  
                  <div className="flex items-center text-xs text-white/80">
                    {formatTaskType(activeTask.type)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {/* Priority Icon */}
                      <PriorityIcon priority={activeTask.priority} size="sm" />
                      
                      {/* Deadline next to Priority */}
                      <DeadlineBadge deadline={activeTask.deadline} className="text-xs" />
                      
                      {/* Related Athletes for drag overlay */}
                      {activeTask.relatedAthletes && activeTask.relatedAthletes.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-white/60" />
                          <div className="flex -space-x-1">
                            {activeTask.relatedAthletes.length === 1 ? (
                              <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-medium border-2 border-white/20">
                                1
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-medium border-2 border-white/20">
                                +{activeTask.relatedAthletes.length}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div></div>
                  </div>
                  
                  {/* Assignee Avatar - Bottom Right Corner for drag overlay */}
                  {activeTask.assignee && (
                    <div className="absolute bottom-0 right-0">
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-medium border-2 border-white/20">
                        {activeTask.assignee.charAt(0)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 bg-[#1C1C1B] border-none overflow-hidden">
          <ScrollArea className="max-h-[90vh] p-4">
            {selectedTask && (
              <TaskDetails
                task={selectedTask}
                onStatusUpdate={onTaskStatusChange!}
                onEdit={handleEditTask}
                showEditButton={true}
                layout="modal"
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
