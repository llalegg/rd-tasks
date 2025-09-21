import React from 'react';

interface TypeBadgeProps {
  type: string;
  className?: string;
}

export function TypeBadge({ type, className = '' }: TypeBadgeProps) {
  const typeMapping: { [key: string]: string } = {
    'general': 'General Task',
    'recovery': 'Recovery',
    'strength': 'Strength Training',
    'endurance': 'Endurance',
    'analysis': 'Analysis',
    'assessment': 'Assessment',
    'mechanicalanalysis': 'Mechanical Analysis',
    'generaltodo': 'General Task',
    'datareporting': 'Data Reporting',
    'injury': 'Injury',
    'schedulecall': 'Schedule Call',
    'coachassignment': 'Coach Assignment',
    'createprogram': 'Create Program',
    'assessmentreview': 'Assessment Review'
  };
  
  const displayText = typeMapping[type] || 'Mechanical Analysis';
  
  return (
    <div className={`backdrop-blur-[20px] backdrop-filter bg-[rgba(0,0,0,0.25)] flex items-center justify-center gap-1 px-2 py-0.5 rounded-[9999px] ${className}`}>
      <span className="font-medium text-xs leading-[1.32] text-[#f7f6f2] text-center whitespace-nowrap font-montserrat">
        {displayText}
      </span>
    </div>
  );
}
