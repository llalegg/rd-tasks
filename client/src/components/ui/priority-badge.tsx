import React from 'react';
import { AlertTriangle, Minus, ArrowDown } from 'lucide-react';
import { Task } from "@shared/schema";

interface PriorityBadgeProps {
  priority: Task['priority'];
  className?: string;
  showText?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className, showText = true }) => {
  const getPriorityConfig = (priority: Task['priority']) => {
    switch (priority) {
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

  const config = getPriorityConfig(priority);
  const IconComponent = config.icon;

  return (
    <div 
      className={`flex items-center gap-1 ${showText ? 'px-2' : 'px-1'} py-0.5 rounded-[9999px] ${className}`}
      style={{ backgroundColor: config.bgColor }}
    >
      <IconComponent 
        className="w-4 h-4 flex-shrink-0" 
        style={{ color: config.iconColor, width: '16px', height: '16px' }}
      />
      {showText && (
        <span 
          className="text-xs font-medium whitespace-nowrap"
          style={{ 
            color: config.iconColor,
            fontFamily: 'Montserrat',
            fontWeight: 500,
            fontSize: '12px',
            lineHeight: '1.32'
          }}
        >
          {config.label}
        </span>
      )}
    </div>
  );
};