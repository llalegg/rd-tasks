import React from 'react';

export interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getPriorityConfig = () => {
    switch (priority.toLowerCase()) {
      case 'high':
        return {
          bgColor: '#321a1a',
          textColor: '#f87171',
          iconMask: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 7 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='currentColor' stroke-width='1.5' fill='none' d='M3.5 1v6M1 3.5l2.5-2.5 2.5 2.5'/%3E%3C/svg%3E\")",
          text: 'High'
        };
      case 'medium':
        return {
          bgColor: '#302608',
          textColor: '#facc15',
          iconMask: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 12 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='currentColor' stroke-width='1.5' fill='none' d='M1 3h10M8 1l3 2-3 2'/%3E%3C/svg%3E\")",
          text: 'Medium'
        };
      case 'low':
        return {
          bgColor: 'rgba(255, 255, 255, 0.08)',
          textColor: '#979795',
          iconMask: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 9 2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='currentColor' stroke-width='1.5' fill='none' d='M1 1h7'/%3E%3C/svg%3E\")",
          text: 'Low'
        };
      default:
        return {
          bgColor: '#302608',
          textColor: '#facc15',
          iconMask: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 12 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='currentColor' stroke-width='1.5' fill='none' d='M1 3h10M8 1l3 2-3 2'/%3E%3C/svg%3E\")",
          text: 'Medium'
        };
    }
  };

  const config = getPriorityConfig();

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
          maskImage: config.iconMask,
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskSize: 'contain'
        }}
      />
      <span>{config.text}</span>
    </div>
  );
}
