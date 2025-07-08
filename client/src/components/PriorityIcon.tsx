import { AlertTriangle, Minus, ArrowUp } from "lucide-react";
import { Task } from "@shared/schema";

interface PriorityIconProps {
  priority: Task['priority'];
  size?: "sm" | "md" | "lg";
}

export default function PriorityIcon({ priority, size = "sm" }: PriorityIconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const iconSize = sizeClasses[size];

  switch (priority) {
    case 'high':
      return (
        <div className="flex items-center" title="High Priority">
          <AlertTriangle className={`${iconSize} text-red-500`} />
        </div>
      );
    case 'medium':
      return (
        <div className="flex items-center" title="Medium Priority">
          <ArrowUp className={`${iconSize} text-yellow-500`} />
        </div>
      );
    case 'low':
      return (
        <div className="flex items-center" title="Low Priority">
          <Minus className={`${iconSize} text-green-500`} />
        </div>
      );
    default:
      return null;
  }
}