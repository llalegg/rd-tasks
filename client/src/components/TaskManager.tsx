import React, { useState, useMemo } from "react";
import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Edit, X, ChevronDown, Check, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import TaskList from "./TaskList";
import TaskPanelContent from "./TaskPanelContent";
import TaskViewModal from "./TaskViewModal";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { prototypeTasks, prototypePeople, getCoaches, getAthletes } from "@/data/prototypeData";

// Filter Dropdown Component
const FilterDropdown = ({ 
  label, 
  options, 
  value, 
  onChange,
  isOpen,
  onToggle,
  onClose
}: { 
  label: string; 
  options: { value: string; label: string }[]; 
  value: string[];
  onChange: (value: string[]) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) => {
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleOptionToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const clearAll = () => {
    onChange([]);
    onClose();
  };
  
  return (
    <div className="relative">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="flex items-center gap-1.5 px-3 py-2 border border-[#292928] rounded-full bg-transparent text-[#979795] text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-[#292928]"
      >
        <span>{label}</span>
        {value.length > 0 && (
          <div className="bg-white text-black rounded-full px-1.5 py-0.5 text-xs font-semibold min-w-[18px] h-5 flex items-center justify-center shadow-sm">
            {value.length}
          </div>
        )}
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute top-full mt-1 left-0 bg-[#292928] border border-[#3D3D3C] rounded-lg shadow-lg z-50 min-w-[140px]"
        >
          <div className="py-1">
            <button
              onClick={clearAll}
              className="w-full text-left px-3 py-2 text-xs text-[#f7f6f2] hover:bg-[#3a3a38] transition-colors border-b border-[#3D3D3C] mb-1"
            >
              Clear All
            </button>
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleOptionToggle(option.value)}
                className="flex items-center px-3 py-2 text-xs text-[#f7f6f2] hover:bg-[#3a3a38] transition-colors cursor-pointer"
              >
                <Checkbox
                  checked={value.includes(option.value)}
                  onCheckedChange={() => handleOptionToggle(option.value)}
                  className="mr-2 h-3 w-3"
                />
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function TaskManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'deadline'>('deadline');
  const [statusFilters, setStatusFilters] = useState<Task['status'][]>(['new', 'in_progress', 'pending', 'completed']);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [creatorFilters, setCreatorFilters] = useState<string[]>([]);
  const [athleteFilters, setAthleteFilters] = useState<string[]>([]);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [showFilters, setShowFilters] = useState(false);

  // Use prototype data for tasks
  const [tasks, setTasks] = useState<Task[]>(prototypeTasks);
  const isLoading = false;
  const error = null;



  const formatTaskType = (type: string) => {
    // Handle camelCase words by splitting on capital letters
    return type
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .replace(/\b\w/g, str => str.toUpperCase()); // Capitalize each word
  };

  // Use prototype data for users and athletes
  const users = getCoaches(); // Coaches act as users/assignees
  const athletes = getAthletes(); // Athletes for task relationships

  // Get unique assignees from current tasks
  const availableAssignees = Array.from(new Set(tasks.map((task: Task) => task.assigneeId)))
    .map(id => users.find((u: any) => u.id === id))
    .filter(Boolean);

  // Filter and sort tasks based on search query and filters
  const filteredTasks = tasks.filter((task: Task) => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Hide completed tasks if option is enabled
    if (hideCompleted && task.status === 'completed') return false;
    
    // Apply quick filters
    const matchesAssignee = assigneeFilter.length === 0 || assigneeFilter.includes(task.assigneeId || '');
    const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(task.priority);
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(task.status);
    
    // Apply other filters
    const matchesStatusFilters = statusFilters.length === 0 || statusFilters.includes(task.status);
    const matchesType = typeFilters.length === 0 || typeFilters.includes(task.type);
    const matchesCreator = creatorFilters.length === 0 || creatorFilters.includes(task.creatorId || '');
    const matchesAthlete = athleteFilters.length === 0 || 
      ((task as any).relatedAthleteIds && (task as any).relatedAthleteIds.some((id: string) => athleteFilters.includes(id)));
    
    return matchesSearch && matchesAssignee && matchesPriority && matchesStatus && matchesStatusFilters && matchesType && matchesCreator && matchesAthlete;
  }).sort((a: Task, b: Task) => {
    if (sortBy === 'deadline') {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    return 0;
  });

  // Update task status (prototype version)
  const updateTaskStatus = ({ taskId, status }: { taskId: string; status: Task['status'] }) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status, updatedAt: new Date() }
          : task
      )
    );
    toast({
      title: "Success",
      description: "Task status updated successfully",
    });
  };


  // Delete task (prototype version)
  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    setSelectedTask(null);
    toast({
      title: "Success", 
      description: "Task deleted successfully",
    });
  };

  const handleTaskClick = (task: Task) => {
    setViewTask(task);
    setIsViewModalOpen(true);
  };

  const handleAddTask = () => {
    // Get first coach as default assignee
    const defaultAssignee = users?.[0]?.id || 'coach1';
    
    // Create a new task with prototype data structure
    const newTask: Task = {
      id: 'task_' + Date.now(), // Generate unique ID
      name: 'New Task',
      description: 'Task description',
      type: 'general',
      status: 'new',
      priority: 'medium',
      deadline: null,
      assigneeId: defaultAssignee,
      creatorId: defaultAssignee,
      createdAt: new Date(),
      updatedAt: new Date(),
      relatedAthleteIds: []
    };
    
    // Add to tasks list immediately
    setTasks(prevTasks => [newTask, ...prevTasks]);
    
    // Open the modal to edit details
    setViewTask(newTask);
    setIsViewModalOpen(true);
    
    toast({
      title: "Success",
      description: "New task created! Edit the details below.",
    });
  };


  const handleStatusUpdate = (taskId: string, newStatus: Task['status']) => {
    updateTaskStatus({ taskId, status: newStatus });
  };




  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };


  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'pending': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'new': return 'New';
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
    <div className="min-h-screen bg-transparent flex md:ml-[80px] pb-[80px] md:pb-0">
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        selectedTask && !isMobile ? 'md:pr-[500px]' : ''
      }`}>
        {/* Header */}
        <header className={`fixed top-0 left-0 right-0 z-40 md:left-[80px] transition-all duration-300 ${selectedTask && !isMobile ? 'md:right-[500px]' : 'right-0'} ${isMobile ? 'bg-[#0a0a09] backdrop-blur-sm border-b border-[#292928]' : 'bg-transparent'}`}>
          {/* Mobile Header */}
          {isMobile ? (
            <>
              {/* Main header row */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-[#f7f6f2] font-montserrat leading-[1.32]">Tasks</h1>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Mobile view toggle */}
                  <div className="flex items-center bg-[#292928] rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded transition-colors ${
                        viewMode === 'list' ? 'bg-[#3a3a38] text-[#f7f6f2]' : 'text-[#979795]'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`p-1.5 rounded transition-colors ${
                        viewMode === 'cards' ? 'bg-[#3a3a38] text-[#f7f6f2]' : 'text-[#979795]'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Filters toggle for mobile */}
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`h-9 w-9 p-0 rounded-lg transition-all duration-200 ${
                      showFilters ? 'bg-[#e5e4e1] text-black' : 'bg-[#292928] text-[#f7f6f2] hover:bg-[#3a3a38]'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={handleAddTask}
                    className="bg-white hover:bg-gray-100 text-black font-medium px-3 py-2 rounded-full text-xs h-9 transition-all duration-200"
                  >
                    <span>Add</span>
                  </Button>
                </div>
              </div>

              {/* Search bar - always visible on mobile */}
              <div className="px-4 pb-3">
                <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#292928] rounded-lg">
                  <Search className="w-4 h-4 text-[#979795]" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-[#f7f6f2] text-sm font-montserrat flex-1 placeholder-[#979795] focus:ring-0 focus:outline-none p-0 h-auto"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Desktop Header - Original Style */
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-5 py-4 md:py-5 bg-transparent min-h-[72px] gap-4 md:gap-0">
              <div className="flex items-center">
                <h1 className="text-2xl font-semibold text-[#f7f6f2] font-montserrat leading-[1.32]">Tasks</h1>
              </div>
              
              <div className="flex items-center gap-2 md:gap-3 flex-wrap w-full md:w-auto justify-start md:justify-end">
                <FilterDropdown 
                  label="Assignee" 
                  options={availableAssignees.map((user: any) => ({ value: user.id, label: user.name }))}
                  value={assigneeFilter}
                  onChange={setAssigneeFilter}
                  isOpen={openDropdown === 'assignee'}
                  onToggle={() => setOpenDropdown(openDropdown === 'assignee' ? null : 'assignee')}
                  onClose={() => setOpenDropdown(null)}
                />
                <FilterDropdown 
                  label="Priority" 
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' }
                  ]}
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                  isOpen={openDropdown === 'priority'}
                  onToggle={() => setOpenDropdown(openDropdown === 'priority' ? null : 'priority')}
                  onClose={() => setOpenDropdown(null)}
                />
                <FilterDropdown 
                  label="Status" 
                  options={[
                    { value: 'new', label: 'New' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'completed', label: 'Completed' }
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  isOpen={openDropdown === 'status'}
                  onToggle={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                  onClose={() => setOpenDropdown(null)}
                />
                
                <div className="flex items-center gap-2.5 px-3 py-2 bg-[#292928] rounded-lg h-8 w-full sm:w-auto sm:min-w-[160px] md:min-w-[200px] max-w-[280px]">
                  <Search className="w-4 h-4 text-[#f7f6f2]" />
                  <input
                    type="text"
                    placeholder="Search by task name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-[#f7f6f2] text-sm font-montserrat flex-1 placeholder-[#979795] focus:ring-0 focus:outline-none p-0 h-auto"
                  />
                </div>
                
                <Button className="flex items-center gap-2 px-3 py-2 bg-[#292928] border-none rounded-full text-[#f7f6f2] text-xs font-medium cursor-pointer h-8 min-w-[86px] justify-center transition-all duration-200 hover:bg-[#3a3a38]">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>

                <Button
                  onClick={handleAddTask}
                  className="bg-white hover:bg-gray-100 text-black font-medium px-3 py-2 rounded-full text-xs h-8 min-w-[86px] justify-center transition-all duration-200"
                >
                  <span className="hidden sm:inline">Add Task</span>
                </Button>
              </div>
            </div>
          )}

          {/* Mobile filters panel */}
          {isMobile && showFilters && (
            <div className="border-t border-[#292928] bg-[#171716] p-4">
              <div className="flex flex-col gap-3">
                <FilterDropdown 
                  label="Assignee" 
                  options={availableAssignees.map((user: any) => ({ value: user.id, label: user.name }))}
                  value={assigneeFilter}
                  onChange={setAssigneeFilter}
                  isOpen={openDropdown === 'assignee'}
                  onToggle={() => setOpenDropdown(openDropdown === 'assignee' ? null : 'assignee')}
                  onClose={() => setOpenDropdown(null)}
                />
                <FilterDropdown 
                  label="Priority" 
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' }
                  ]}
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                  isOpen={openDropdown === 'priority'}
                  onToggle={() => setOpenDropdown(openDropdown === 'priority' ? null : 'priority')}
                  onClose={() => setOpenDropdown(null)}
                />
                <FilterDropdown 
                  label="Status" 
                  options={[
                    { value: 'new', label: 'New' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'completed', label: 'Completed' }
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  isOpen={openDropdown === 'status'}
                  onToggle={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                  onClose={() => setOpenDropdown(null)}
                />
              </div>
            </div>
          )}
        </header>
        {/* Main Content */}
        <main className={`w-full p-4 md:p-5 ${
          isMobile 
            ? showFilters ? 'pt-[240px]' : 'pt-[140px]'
            : 'pt-[120px] md:pt-[88px]'
        }`}>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
            </div>
          ) : (
            <TaskList 
              tasks={filteredTasks} 
              onTaskClick={handleTaskClick}
              onStatusUpdate={handleStatusUpdate}
              onDeleteTask={handleDeleteTask}
              viewMode={isMobile ? viewMode : 'list'}
              isMobile={isMobile}
            />
          )}
        </main>
      </div>

      {/* Task Detail Panel - Hidden on mobile (use modal instead) */}
      {selectedTask && !isMobile && (
        <div className="fixed top-0 right-0 w-[500px] h-full bg-[#1C1C1B] border-l border-[#292928] z-40 flex flex-col">
          {/* Panel Header */}
          <div className="flex items-center justify-end p-4 bg-transparent">
            <div className="flex items-center gap-1">
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


      {/* Task View Modal */}
      <TaskViewModal
        task={viewTask}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewTask(null);
        }}
        onStatusUpdate={handleStatusUpdate}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
}
