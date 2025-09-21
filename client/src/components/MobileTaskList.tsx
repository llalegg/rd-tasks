import React from "react";
import { AlertTriangle, Clock, User, Minus, ArrowDown } from "lucide-react";
import { Task } from "@shared/schema";

interface MobileTaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  users?: any[];
}

export function MobileTaskList({ tasks, onTaskClick, users = [] }: MobileTaskListProps) {
  
  // Status badge with same logic as desktop
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return {
          bgColor: '#31180f',
          textColor: '#ff8254',
          icon: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 18 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='%23ff8254' stroke-width='1.5' fill='none' d='M9 1v18M1 9l8-8 8 8'/%3E%3C/svg%3E\")",
          text: 'New'
        };
      case 'in_progress':
        return {
          bgColor: '#162949',
          textColor: '#3f83f8',
          icon: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 18 18' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='9' cy='9' r='7' stroke='%233f83f8' stroke-width='1.5' fill='none'/%3E%3Cpath stroke='%233f83f8' stroke-width='1.5' fill='none' d='M9 5v4l3 3'/%3E%3C/svg%3E\")",
          text: 'In progress'
        };
      case 'blocked':
        return {
          bgColor: '#321a1a',
          textColor: '#f87171',
          icon: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='8' stroke='%23f87171' stroke-width='1.5' fill='none'/%3E%3Cpath stroke='%23f87171' stroke-width='1.5' d='M6 6l8 8M14 6l-8 8'/%3E%3C/svg%3E\")",
          text: 'Blocked'
        };
      case 'completed':
        return {
          bgColor: '#072a15',
          textColor: '#4ade80',
          icon: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 16 11' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='%234ade80' stroke-width='1.5' fill='none' d='M1 5l4 4 9-9'/%3E%3C/svg%3E\")",
          text: 'Completed'
        };
      default:
        return {
          bgColor: '#31180f',
          textColor: '#ff8254',
          icon: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 18 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='%23ff8254' stroke-width='1.5' fill='none' d='M9 1v18M1 9l8-8 8 8'/%3E%3C/svg%3E\")",
          text: 'New'
        };
    }
  };

  // Priority badge - exact same as desktop version
  const getPriorityConfig = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return {
          bgColor: '#321a1a',
          iconColor: '#f87171',
          icon: AlertTriangle,
          label: 'High'
        };
      case 'medium':
        return {
          bgColor: '#302608',
          iconColor: '#facc15',
          icon: Minus,
          label: 'Medium'
        };
      case 'low':
        return {
          bgColor: 'rgba(255,255,255,0.08)',
          iconColor: '#979795',
          icon: ArrowDown,
          label: 'Low'
        };
      default:
        return {
          bgColor: '#302608',
          iconColor: '#facc15',
          icon: Minus,
          label: 'Medium'
        };
    }
  };

  // Deadline formatting like desktop
  const formatDeadline = (deadline: string | Date | undefined) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
    if (diffDays <= 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDeadlineColor = (deadline: string | Date | undefined) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { bg: '#321a1a', text: '#f87171' }; // Overdue - red
    if (diffDays === 0) return { bg: '#302608', text: '#facc15' }; // Today - yellow
    if (diffDays <= 3) return { bg: '#302608', text: '#facc15' }; // Soon - yellow
    return { bg: '#2d2d2a', text: '#979795' }; // Normal - gray
  };

  // Task type formatting
  const formatTaskType = (type: string) => {
    return type
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, str => str.toUpperCase())
      .replace(/\b\w/g, str => str.toUpperCase());
  };

  return (
    <div className="flex flex-col gap-[2px] overflow-hidden rounded-[16px] w-full">
      {tasks.map((task) => {
        const statusConfig = getStatusConfig(task.status);
        const priorityConfig = getPriorityConfig(task.priority);
        const deadlineText = formatDeadline(task.deadline);
        const deadlineColor = getDeadlineColor(task.deadline);
        const assignee = users.find(u => u.id === task.assigneeId);

        return (
          <div
            key={task.id}
            className="bg-[#1c1c1b] flex flex-col gap-[8px] items-start justify-center p-[16px] w-full cursor-pointer hover:bg-[#1f1f1e] transition-colors"
            onClick={() => onTaskClick?.(task)}
          >
            {/* Task Title and Status */}
            <div className="flex items-start justify-between w-full">
              <h3 className="font-montserrat text-[14px] font-semibold leading-[1.46] text-[#f7f6f2] overflow-ellipsis overflow-hidden text-nowrap flex-1 pr-2">
                {task.name}
              </h3>
              <div 
                className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                style={{ 
                  backgroundColor: statusConfig.bgColor, 
                  color: statusConfig.textColor,
                  fontFamily: 'Montserrat',
                  fontWeight: 500,
                  fontSize: '12px',
                  lineHeight: '1.32'
                }}
              >
                <div 
                  className="w-4 h-4 flex-shrink-0"
                  style={{
                    background: statusConfig.textColor,
                    maskImage: statusConfig.icon,
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    maskSize: 'contain',
                    width: '16px',
                    height: '16px'
                  }}
                />
                <span>{statusConfig.text}</span>
              </div>
            </div>

            {/* Badges Row */}
            <div className="flex gap-[8px] items-start flex-wrap">
              {/* Priority Badge - exact same as desktop */}
              {priorityConfig && (() => {
                const IconComponent = priorityConfig.icon;
                return (
                  <div 
                    className="flex items-center gap-1 px-2 py-0.5 rounded-[9999px]"
                    style={{ backgroundColor: priorityConfig.bgColor }}
                  >
                    <IconComponent 
                      className="w-4 h-4 flex-shrink-0" 
                      style={{ color: priorityConfig.iconColor, width: '16px', height: '16px' }}
                    />
                    <span 
                      className="text-xs font-medium whitespace-nowrap"
                      style={{ 
                        color: priorityConfig.iconColor,
                        fontFamily: 'Montserrat',
                        fontWeight: 500,
                        fontSize: '12px',
                        lineHeight: '1.32'
                      }}
                    >
                      {priorityConfig.label}
                    </span>
                  </div>
                );
              })()}

              {/* Deadline Badge */}
              {deadlineText && deadlineColor && (
                <div 
                  className="flex gap-[4px] items-center justify-center px-[8px] py-[2px] rounded-[9999px]"
                  style={{ backgroundColor: deadlineColor.bg }}
                >
                  <span 
                    className="font-montserrat text-[12px] font-medium leading-[1.32]"
                    style={{ color: deadlineColor.text }}
                  >
                    {deadlineText}
                  </span>
                </div>
              )}

              {/* Task Type Badge */}
              <div className="backdrop-blur-[20px] backdrop-filter bg-[rgba(0,0,0,0.25)] flex gap-[4px] items-center justify-center px-[8px] py-[2px] rounded-[9999px]">
                <span className="font-montserrat text-[12px] font-medium leading-[1.32] text-[#f7f6f2]">
                  {formatTaskType(task.type || 'Task')}
                </span>
              </div>
            </div>

            {/* Assignee */}
            {assignee && (
              <div className="flex gap-[4px] items-center">
                <div 
                  className="w-[20px] h-[20px] rounded-full bg-cover bg-center border border-[#292928]"
                  style={{ 
                    backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=20&h=20&fit=crop&crop=face')"
                  }}
                />
                <span className="font-montserrat text-[12px] font-medium leading-[1.32] text-[#f7f6f2] overflow-ellipsis overflow-hidden text-nowrap">
                  {assignee.name}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
