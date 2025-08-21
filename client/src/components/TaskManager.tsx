import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Filter, List, Columns, Edit, X, ChevronDown, Check } from "lucide-react";
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
  const [currentView, setCurrentView] = useState<'list' | 'kanban'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'deadline'>('deadline');
  const [statusFilters, setStatusFilters] = useState<Task['status'][]>(['new', 'in_progress', 'pending']);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [creatorFilters, setCreatorFilters] = useState<string[]>([]);
  const [athleteFilters, setAthleteFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<Task['priority'][]>([]);
  const [hideCompleted, setHideCompleted] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState<Task['status'][]>(['new', 'in_progress', 'pending', 'completed']);

  // Fetch tasks from API
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: () => fetch('/api/tasks').then(res => res.json()),
  });



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

  // Filter and sort tasks based on search query and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Hide completed tasks if option is enabled
    if (hideCompleted && task.status === 'completed') return false;
    
    // In Kanban view, apply all filters except status (columns represent status)
    // In List view, apply all filters including status
    const matchesStatus = currentView === 'kanban' || statusFilters.length === 0 || statusFilters.includes(task.status);
    const matchesType = typeFilters.length === 0 || typeFilters.includes(task.type);
    const matchesCreator = creatorFilters.length === 0 || creatorFilters.includes(task.creatorId);
    const matchesPriority = priorityFilters.length === 0 || priorityFilters.includes(task.priority);
    const matchesAthlete = athleteFilters.length === 0 || 
      (task.relatedAthleteIds && task.relatedAthleteIds.some(id => athleteFilters.includes(id)));
    
    return matchesSearch && matchesStatus && matchesType && matchesCreator && matchesPriority && matchesAthlete;
  }).sort((a, b) => {
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
      return await apiRequest('PUT', `/api/tasks/${taskId}`, { status });
    },
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    },
    onError: (error) => {

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
      case 'new': return 'To-Do';
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const handleStatusFilterChange = (status: Task['status'], checked: boolean) => {
    if (checked) {
      setStatusFilters(prev => [...prev, status]);
    } else {
      setStatusFilters(prev => prev.filter(s => s !== status));
    }
  };

  const clearStatusFilters = () => {
    setStatusFilters([]);
  };

  const statusOptions: Task['status'][] = ['new', 'in_progress', 'pending', 'completed'];

  return (
    <div className="min-h-screen bg-background flex md:ml-[80px] pb-[64px] md:pb-0">
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        selectedTask ? 'md:pr-[500px]' : ''
      }`}>
        {/* Header */}
        <header className={`bg-background fixed top-0 left-0 z-40 md:ml-[80px] transition-all duration-300 ${selectedTask ? 'right-[500px]' : 'right-0'}`}>
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
                
                {/* Board View Controls - Only show in Kanban view */}
                {currentView === 'kanban' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHideCompleted(!hideCompleted)}
                      className="h-8 px-3 rounded-[9999px] bg-[#292928] border-[#292928] text-[#F7F6F2] hover:bg-[#3D3D3C] text-[12px] font-medium flex-shrink-0"
                    >
                      {hideCompleted ? 'Show' : 'Hide'} Completed
                    </Button>
                    <Select value={sortBy} onValueChange={(value: 'priority' | 'deadline') => setSortBy(value)}>
                      <SelectTrigger className="w-36 h-8 bg-[#292928] border-[#292928] text-[#F7F6F2] text-[12px] font-medium rounded-[9999px] text-left">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#292928] border-none">
                        <SelectItem value="priority" className="text-[12px] hover:bg-muted/50 text-left">Sort by priority</SelectItem>
                        <SelectItem value="deadline" className="text-[12px] hover:bg-muted/50 text-left">Sort by deadline</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}

                {/* Status Filter - Only show in List view */}
                {currentView === 'list' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" size="sm" className="h-8 px-3 rounded-[9999px] bg-[#292928] text-[#F7F6F2] hover:bg-[#3D3D3C] text-[12px] font-medium flex-shrink-0">
                      <Filter className="w-4 h-4" style={{ marginRight: '6px' }} />
                      <span className="hidden sm:inline">
                        {statusFilters.length > 0 ? `Status (${statusFilters.length})` : 'Status'}
                      </span>
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-3 bg-[#292928] border-[#3D3D3C]" align="end">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-[#F7F6F2]">Filter by Status</h4>
                        {statusFilters.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearStatusFilters}
                            className="h-6 px-2 text-[10px] text-[#979795] hover:text-[#F7F6F2]"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {statusOptions.map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${status}`}
                              checked={statusFilters.includes(status)}
                              onCheckedChange={(checked) => handleStatusFilterChange(status, checked === true)}
                              className="border-[#585856] data-[state=checked]:bg-[#E5E4E1] data-[state=checked]:border-[#E5E4E1]"
                            />
                            <label
                              htmlFor={`status-${status}`}
                              className="text-sm text-[#F7F6F2] cursor-pointer"
                            >
                              {getStatusLabel(status)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                )}

                {/* Desktop View Toggle and Add Button */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="flex items-center bg-muted rounded-lg p-1">
                    <Button
                      variant={currentView === 'kanban' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentView('kanban')}
                      className="h-8 w-8 p-0"
                    >
                      <Columns className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={currentView === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentView('list')}
                      className="h-8 w-8 p-0"
                    >
                      <List className="w-4 h-4" />
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
              hideCompleted={hideCompleted}
              visibleColumns={visibleColumns}
            />
          )}
        </main>
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <div className="fixed top-0 right-0 w-full md:w-[500px] h-full bg-[#1C1C1B] border-l border-[#292928] z-40 flex flex-col">
          {/* Panel Header */}
          <div className="flex items-center justify-end p-4 bg-transparent">
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
