import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, List, Columns, Edit, X } from "lucide-react";
import TaskList from "./TaskList";
import TaskKanban from "./TaskKanban";
import TaskForm from "./TaskForm";
import TaskPanelContent from "./TaskPanelContent";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TaskManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentView, setCurrentView] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch tasks from API
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: () => fetch('/api/tasks').then(res => res.json()),
  });

  console.log('Tasks loading state:', { isLoading, tasksCount: tasks.length, error });

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

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task =>
    task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: Task['status'] }) => {
      console.log('updateTaskMutation called with:', { taskId, status });
      const result = await apiRequest(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: { status },
      });
      console.log('updateTaskMutation result:', result);
      return result;
    },
    onSuccess: () => {
      console.log('updateTaskMutation success - invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    },
    onError: (error) => {
      console.error('updateTaskMutation error:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
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

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setSelectedTask(null);
    },
  });

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleStatusUpdate = (taskId: string, newStatus: Task['status']) => {
    console.log('TaskManager handleStatusUpdate called:', { taskId, newStatus });
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
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
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
    <div className="min-h-screen bg-background flex">
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        selectedTask ? 'pr-[500px]' : ''
      }`}>
        {/* Header */}
        <header className="bg-background/95 backdrop-blur-sm sticky top-0 z-40">
          <div className="w-full px-5">
            <div className="flex items-center justify-between h-16 gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-semibold text-foreground">To-Do's</h1>
                </div>
              </div>
              
              {/* Search and Controls */}
              <div className="flex items-center space-x-3 flex-1 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="secondary" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* View Toggle and Add Button */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-muted rounded-lg p-1">
                  <Button
                    variant={currentView === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('list')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={currentView === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('kanban')}
                    className="h-8 w-8 p-0"
                  >
                    <Columns className="w-4 h-4" />
                  </Button>
                </div>
                <Button onClick={handleCreateTask} className="inline-flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
                <Button onClick={() => handleStatusUpdate('11', 'in_progress')} variant="outline" size="sm">
                  Test Status
                </Button>
              </div>
            </div>
          </div>
        </header>
        {/* Main Content */}
        <main className="w-full px-5 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-foreground"></div>
            </div>
          ) : currentView === 'list' ? (
            <TaskList 
              tasks={filteredTasks} 
              onTaskClick={handleTaskClick}
              onStatusUpdate={handleStatusUpdate}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ) : (
            <TaskKanban 
              tasks={filteredTasks} 
              onTaskClick={handleTaskClick}
              onTaskStatusChange={handleStatusUpdate}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </main>
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <div className="fixed top-0 right-0 w-[500px] h-full bg-background border-l border-border z-40 flex flex-col">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedTask.status)}`} />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {getStatusLabel(selectedTask.status)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditTask(selectedTask)}
                className="h-7 w-7 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTask(null)}
                className="h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <TaskPanelContent 
              task={selectedTask}
              onStatusUpdate={handleStatusUpdate}
            />
          </div>
        </div>
      )}

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
