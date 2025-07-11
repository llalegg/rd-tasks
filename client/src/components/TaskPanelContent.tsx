import { Task } from "@shared/schema";
import TaskDetails from "./TaskDetails";

interface TaskPanelContentProps {
  task: Task;
  onStatusUpdate: (taskId: string, newStatus: Task['status']) => void;
}

export default function TaskPanelContent({ task, onStatusUpdate }: TaskPanelContentProps) {
  return (
    <TaskDetails
      task={task}
      onStatusUpdate={onStatusUpdate}
      showEditButton={false}
      layout="sidebar"
    />
  );
}