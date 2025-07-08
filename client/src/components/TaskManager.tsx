import { useState } from "react";
import { Task } from "@shared/schema";
import { mockTasks } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, List, Columns } from "lucide-react";
import TaskList from "./TaskList";
import TaskKanban from "./TaskKanban";
import TaskModal from "./TaskModal";
import TaskForm from "./TaskForm";

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = (taskId: string, newStatus: Task['status']) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
          : task
      )
    );
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
      // Mock task creation - just log the data
      console.log('Creating task:', taskData);
    } else {
      // Mock task update - just log the data
      console.log('Updating task:', taskData);
    }
    setIsFormOpen(false);
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
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <TaskList tasks={tasks} onTaskClick={handleTaskClick} />
          </TabsContent>

          <TabsContent value="kanban" className="mt-8">
            <TaskKanban tasks={tasks} onTaskClick={handleTaskClick} onTaskStatusChange={handleStatusUpdate} />
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
