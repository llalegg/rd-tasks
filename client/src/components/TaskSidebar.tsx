import { useEffect } from "react";
import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const formatTaskType = (type: string) => {
    return type.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

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
        <div className="flex items-center justify-between p-6 border-b border-[#292928]">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white pr-8">{task.name}</h2>
            <Badge variant="outline" className="w-fit mt-2">
              {formatTaskType(task.type)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-8 w-8 p-0 rounded-[9999px] hover:bg-accent hover:text-accent-foreground"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-[9999px] hover:bg-accent hover:text-accent-foreground"
            >
              <X className="h-4 w-4" />
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