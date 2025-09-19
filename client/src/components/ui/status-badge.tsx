import React from 'react';
import { Task } from '@shared/schema';

export interface StatusBadgeProps {
  status: Task['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case 'new':
        return {
          bgColor: '#31180f',
          textColor: '#ff8254',
          iconMask: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 18 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='%23ff8254' stroke-width='1.5' fill='none' d='M9 1v18M1 9l8-8 8 8'/%3E%3C/svg%3E\")",
          text: 'New'
        };
      case 'in_progress':
        return {
          bgColor: '#162949',
          textColor: '#3f83f8',
          iconMask: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 18 18' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='9' cy='9' r='7' stroke='%233f83f8' stroke-width='1.5' fill='none'/%3E%3Cpath stroke='%233f83f8' stroke-width='1.5' fill='none' d='M9 5v4l3 3'/%3E%3C/svg%3E\")",
          text: 'In progress'
        };
      case 'pending':
        return {
          bgColor: '#321a1a',
          textColor: '#f87171',
          iconMask: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='8' stroke='%23f87171' stroke-width='1.5' fill='none'/%3E%3Cpath stroke='%23f87171' stroke-width='1.5' d='M6 6l8 8M14 6l-8 8'/%3E%3C/svg%3E\")",
          text: 'Blocked'
        };
      case 'completed':
        return {
          bgColor: '#072a15',
          textColor: '#4ade80',
          iconMask: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 16 11' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='%234ade80' stroke-width='1.5' fill='none' d='M1 5l4 4 9-9'/%3E%3C/svg%3E\")",
          text: 'Completed'
        };
      default:
        return {
          bgColor: '#31180f',
          textColor: '#ff8254',
          iconMask: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 18 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='%23ff8254' stroke-width='1.5' fill='none' d='M9 1v18M1 9l8-8 8 8'/%3E%3C/svg%3E\")",
          text: 'New'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className="inline-flex items-center justify-center gap-1 px-1 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 500,
        fontSize: '12px',
        lineHeight: '1.32'
      }}
    >
      <div
        className="w-4 h-4 flex-shrink-0"
        style={{
          background: config.textColor,
          mask: `${config.iconMask} no-repeat center`,
          maskSize: 'contain'
        }}
      />
      <span>{config.text}</span>
    </div>
  );
}
