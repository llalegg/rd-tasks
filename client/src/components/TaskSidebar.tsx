import { useEffect } from "react";
import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { X, Edit } from "lucide-react";
import TaskDetails from "./TaskDetails";
import { mockUsers } from "@/data/mockData";

interface TaskSidebarProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (taskId: string, newStatus: Task['status']) => void;
  onEdit: (task: Task) => void;
}

export default function TaskSidebar({ task, isOpen, onClose, onStatusUpdate, onEdit }: TaskSidebarProps) {
  // Handle ESC key to close sidebar
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  if (!task) return null;

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'blocked': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
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
    <>
      {/* Backdrop - removed to allow interaction with main content */}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-[500px] bg-[#1C1C1B] border-l border-[#292928] z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#292928]">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {getStatusLabel(task.status)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-7 w-7 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
          <TaskDetails 
            task={task} 
            onStatusUpdate={onStatusUpdate}
            onEdit={onEdit}
            showEditButton={true}
            layout="sidebar"
          />
        </div>
      </div>
    </>
  );
}