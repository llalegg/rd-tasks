import React from 'react';
import { getStatusConfig } from '@/lib/statusUtils';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = getStatusConfig(status);

  return (
    <span 
      className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ 
        backgroundColor: config.bgColor, 
        color: config.textColor,
        fontFamily: 'Montserrat',
        fontWeight: 500,
        fontSize: '12px',
        lineHeight: '1.32'
      }}
    >
      <div 
        className="w-4 h-4 flex-shrink-0"
        style={{
          background: config.textColor,
          maskImage: config.icon,
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskSize: 'contain',
          width: '16px',
          height: '16px'
        }}
      />
      <span>{config.text}</span>
    </span>
  );
};