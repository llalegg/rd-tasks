import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, List, Columns } from "lucide-react";
import TaskList from "./TaskList";
import TaskKanban from "./TaskKanban";
import TaskModal from "./TaskModal";
import TaskForm from "./TaskForm";
import { apiRequest } from "@/lib/queryClient";

export default function TaskManager() {
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Fetch tasks from API
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: () => fetch('/api/tasks').then(res => res.json()),
  });

  // Fetch users from API
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
  });

  // Fetch athletes from API
  const { data: athletes = [] } = useQuery({
    queryKey: ['/api/athletes'],
    queryFn: () => fetch('/api/athletes').then(res => res.json()),
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: Task['status'] }) => {
      return apiRequest(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: { status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      return apiRequest('/api/tasks', {
        method: 'POST',
        body: taskData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsFormOpen(false);
    },
  });

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = (taskId: string, newStatus: Task['status']) => {
    updateTaskMutation.mutate({ taskId, status: newStatus });
  };

  const handleCreateTask = () => {
    setFormMode('create');
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setFormMode('edit');
    setSelectedTask(task);
    setIsFormOpen(true);
    setIsModalOpen(false);
  };

  const handleFormSubmit = (taskData: Partial<Task>) => {
    if (formMode === 'create') {
      createTaskMutation.mutate({
        ...taskData,
        status: 'new' as Task['status'],
        creatorId: '1', // Default creator ID
      });
    } else if (formMode === 'edit' && selectedTask) {
      updateTaskMutation.mutate({ 
        taskId: selectedTask.id, 
        status: taskData.status || selectedTask.status 
      });
      setIsFormOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-semibold text-foreground">To-Do's</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleCreateTask} className="inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="container mx-auto px-5 py-8 ml-[20px] mr-[20px] pl-[0px] pr-[0px] pt-[0px] pb-[0px]">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <Columns className="w-4 h-4" />
              Kanban View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-8">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-foreground"></div>
              </div>
            ) : (
              <TaskList tasks={tasks} onTaskClick={handleTaskClick} />
            )}
          </TabsContent>

          <TabsContent value="kanban" className="mt-8">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-foreground"></div>
              </div>
            ) : (
              <TaskKanban tasks={tasks} onTaskClick={handleTaskClick} onTaskStatusChange={handleStatusUpdate} />
            )}
          </TabsContent>
        </Tabs>
      </main>
      {/* Task Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusUpdate={handleStatusUpdate}
        onEdit={handleEditTask}
      />
      {/* Task Form */}
      <TaskForm
        task={selectedTask}
        isOpen={isFormOpen}
        mode={formMode}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
