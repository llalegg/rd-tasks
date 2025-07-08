import { Task } from "@shared/schema";
import { mockUsers, mockAthletes } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Tag, User, Users } from "lucide-react";
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
    task.relatedAthleteIds.map(id => mockAthletes.find(a => a.id === id)?.name).filter(Boolean) : 
    [];

  const formatTaskType = (type: string) => {
    return type.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

  const getPriorityVariant = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
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
          <Badge variant={getPriorityVariant(task.priority)} className="text-xs ml-2 flex-shrink-0">
            {task.priority.toUpperCase()}
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {task.description || 'No description'}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Tag className="w-3 h-3 mr-1" />
            {formatTaskType(task.type)}
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <User className="w-3 h-3 mr-1" />
            {assignee?.name || 'Unassigned'}
          </div>
          
          {task.deadline && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(task.deadline).toLocaleDateString()}
            </div>
          )}
          
          {relatedAthletes.length > 0 && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Users className="w-3 h-3 mr-1" />
              {relatedAthletes.slice(0, 2).join(', ')}
              {relatedAthletes.length > 2 && ` +${relatedAthletes.length - 2}`}
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
    <Card ref={setNodeRef} className="h-fit">
      <CardHeader className="pb-3">
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
      <CardContent className="space-y-3 min-h-[200px]">
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
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter(task => task.status === column.key);
          
          return (
            <DroppableColumn
              key={column.key}
              column={column}
              tasks={columnTasks}
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
  );
}
