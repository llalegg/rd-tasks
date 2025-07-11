import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'none'>('deadline');

  // Fetch tasks from API
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: () => fetch('/api/tasks').then(res => res.json()),
  });

  console.log('Tasks loading state:', { isLoading, tasksCount: tasks.length, error });

  const formatTaskType = (type: string) => {
    return type.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

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

  // Filter and sort tasks based on search query and sort option
  const filteredTasks = tasks.filter(task => 
    task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    } else if (sortBy === 'deadline') {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    return 0;
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: Task['status'] }) => {
      console.log('updateTaskMutation called with:', { taskId, status });
      const result = await apiRequest('PUT', `/api/tasks/${taskId}`, { status });
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
      return apiRequest('POST', '/api/tasks', taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsFormOpen(false);
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest('DELETE', `/api/tasks/${taskId}`);
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

  const handleCreateTaskWithStatus = (status: Task['status']) => {
    setFormMode('create');
    setSelectedTask({ status } as Task);
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
        status: selectedTask?.status || 'new' as Task['status'],
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
    <div className="min-h-screen bg-background flex md:ml-[80px] pb-[64px] md:pb-0">
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        selectedTask ? 'md:pr-[500px]' : ''
      }`}>
        {/* Header */}
        <header className="bg-background fixed top-0 left-0 right-0 z-40 md:ml-[80px]">
          <div className="w-full px-3 md:px-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-3 md:py-0 md:h-16 gap-3 md:gap-4">
              {/* Left Side - Title */}
              <div className="flex items-center justify-between w-full md:w-auto">
                <div className="flex-shrink-0">
                  <h1 className="text-lg md:text-xl font-semibold text-foreground">To-Do's</h1>
                </div>
                
                {/* Mobile View Toggle */}
                <div className="flex md:hidden items-center bg-muted rounded-lg p-1">
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
              </div>
              
              {/* Right Side - Search, Filters, View Toggle and Add Button */}
              <div className="flex items-center space-x-2 md:space-x-3 w-full md:w-auto">
                {/* Search Input */}
                <div className="flex p-0 items-center gap-[10px] flex-1 md:flex-none md:w-64 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
                  <Input
                    placeholder="Search tasks"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-sm h-8 px-3 py-2 rounded-lg bg-[#292928] border-[#292928] w-full"
                    style={{ paddingLeft: '32px' }}
                  />
                </div>
                
                {/* Sort Dropdown - Only show in Kanban view */}
                {currentView === 'kanban' && (
                  <Select value={sortBy} onValueChange={(value: 'priority' | 'deadline' | 'none') => setSortBy(value)}>
                    <SelectTrigger className="w-32 h-8 bg-[#292928] border-[#292928] text-[#F7F6F2] text-[12px] font-medium rounded-[9999px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#292928] border-none">
                      <SelectItem value="priority" className="text-[12px] hover:bg-muted/50">Priority</SelectItem>
                      <SelectItem value="deadline" className="text-[12px] hover:bg-muted/50">Deadline</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Filters Button */}
                <Button variant="secondary" size="sm" className="h-8 px-3 rounded-[9999px] bg-[#292928] text-[#F7F6F2] hover:bg-[#3D3D3C] text-[12px] font-medium flex-shrink-0">
                  <Filter className="w-4 h-4" style={{ marginRight: '6px' }} />
                  <span className="hidden sm:inline">Filters</span>
                </Button>

                {/* Desktop View Toggle and Add Button */}
                <div className="hidden md:flex items-center space-x-3">
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
                  <Button onClick={handleCreateTask} className="flex h-8 px-3 py-2 justify-center items-center rounded-[9999px] bg-[#E5E4E1] text-[#000000] hover:bg-[#CFCECA] font-semibold text-[12px]">
                    Add Task
                  </Button>
                </div>
              </div>
              
              {/* Mobile Add Button */}
              <div className="md:hidden w-full">
                <Button onClick={handleCreateTask} className="w-full flex h-8 px-3 py-2 justify-center items-center rounded-[9999px] bg-[#E5E4E1] text-[#000000] hover:bg-[#CFCECA] font-semibold text-[12px]">
                  Add Task
                </Button>
              </div>
            </div>
          </div>
        </header>
        {/* Main Content */}
        <main className="w-full px-3 md:px-5 py-4 md:py-8 pt-16 md:pt-20">
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
              onCreateTask={handleCreateTaskWithStatus}
            />
          )}
        </main>
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <div className="fixed top-0 right-0 w-full md:w-[500px] h-full bg-[#1C1C1B] border-l border-[#292928] z-40 flex flex-col relative">
          {/* Panel Header */}
          <div className="flex items-start justify-between p-6 border-b border-[#292928]">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white pr-8">{selectedTask.name}</h2>
              <Badge variant="outline" className="w-fit mt-2">
                {formatTaskType(selectedTask.type)}
              </Badge>
              <div className="mt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEditTask(selectedTask)}
                  className="h-8 px-3 text-xs"
                >
                  Edit
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTask(null)}
              className="h-8 w-8 p-0 rounded-[9999px] hover:bg-accent hover:text-accent-foreground absolute top-4 right-4"
            >
              <X className="h-4 w-4" />
            </Button>
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
