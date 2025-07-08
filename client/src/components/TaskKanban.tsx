import { Task } from "@shared/schema";
import { mockUsers, mockAthletes } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Tag, User, Users } from "lucide-react";
import DeadlineBadge from "./DeadlineBadge";
import UserAvatar from "./UserAvatar";
import PriorityIcon from "./PriorityIcon";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface TaskKanbanProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusChange?: (taskId: string, newStatus: Task['status']) => void;
}

// Sortable Task Card Component
interface SortableTaskCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
}

function SortableTaskCard({ task, onTaskClick }: SortableTaskCardProps) {
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

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1 ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={() => onTaskClick(task)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-sm font-medium text-foreground line-clamp-2 flex-1">
            {task.name}
          </h4>
          <PriorityIcon priority={task.priority} size="sm" />
        </div>
        
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {task.description || 'No description'}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Tag className="w-3 h-3 mr-1" />
            {formatTaskType(task.type)}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {assignee ? (
                <UserAvatar
                  userId={assignee.id}
                  name={assignee.name}
                  size="sm"
                />
              ) : (
                <span className="text-xs text-muted-foreground">Unassigned</span>
              )}
            </div>
            <DeadlineBadge deadline={task.deadline} className="text-xs" />
          </div>
          
          {relatedAthletes.length > 0 && (
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3 text-muted-foreground" />
              <div className="flex -space-x-1">
                {relatedAthletes.slice(0, 3).map((athlete, index) => (
                  <UserAvatar
                    key={athlete!.id}
                    userId={athlete!.id}
                    name={athlete!.name}
                    size="sm"
                  />
                ))}
                {relatedAthletes.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    +{relatedAthletes.length - 3}
                  </div>
                )}
              </div>
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
}

function DroppableColumn({ column, tasks, onTaskClick }: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.key,
  });

  return (
    <Card ref={setNodeRef} className="h-fit bg-muted/20">
      <CardHeader className="pb-2 px-2 pt-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${column.color}`} />
            {column.title}
          </div>
          <Badge variant="outline" className="text-xs">
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 min-h-[200px] px-2 pb-2">
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
            />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}

export default function TaskKanban({ tasks, onTaskClick, onTaskStatusChange }: TaskKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'deadline'>('priority');
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = [
    { key: 'new', title: 'New', color: 'bg-slate-500' },
    { key: 'in_progress', title: 'In Progress', color: 'bg-blue-500' },
    { key: 'pending', title: 'Pending', color: 'bg-amber-500' },
    { key: 'completed', title: 'Completed', color: 'bg-emerald-500' }
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Get the task that was dragged
    const draggedTask = tasks.find(task => task.id === activeId);
    if (!draggedTask) return;

    // Check if we're dropping over a column (different from current status)
    const columnStatuses = columns.map(col => col.key);
    if (columnStatuses.includes(overId) && overId !== draggedTask.status) {
      onTaskStatusChange?.(activeId, overId as Task['status']);
    }
  };

  const activeTask = activeId ? tasks.find(task => task.id === activeId) : null;

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm font-medium">Sort by:</label>
        <Select value={sortBy} onValueChange={(value: 'priority' | 'deadline') => setSortBy(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {columns.map((column) => {
            const columnTasks = tasks.filter(task => task.status === column.key);
            const sortedTasks = sortTasks(columnTasks);
            
            return (
              <DroppableColumn
                key={column.key}
                column={column}
                tasks={sortedTasks}
                onTaskClick={onTaskClick}
              />
            );
          })}
        </div>
        
        <DragOverlay>
          {activeTask ? (
            <SortableTaskCard
              task={activeTask}
              onTaskClick={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
