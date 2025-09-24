import React from 'react';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Phone, FileText } from 'lucide-react';

interface ActionButtonProps {
  taskType: string;
  onClick: () => void;
  disabled?: boolean;
}

export function ActionButton({ taskType, onClick, disabled = false }: ActionButtonProps) {
  const getActionConfig = () => {
    switch (taskType) {
      case 'injury_call':
      case 'onboarding_call':
        return {
          icon: Phone,
          tooltip: 'Schedule call',
          variant: 'default' as const
        };
      case 'coach_assignment':
        return {
          icon: FileText,
          tooltip: 'Go to assignment',
          variant: 'default' as const
        };
      case 'assessment_review':
        return {
          icon: FileText,
          tooltip: 'Go to assessment',
          variant: 'default' as const
        };
      default:
        return null;
    }
  };

  const config = getActionConfig();
  
  if (!config) {
    return null;
  }

  const IconComponent = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={config.variant}
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className="h-8 w-8 p-0 bg-[#292928] hover:bg-[#3a3a38] border border-[#3d3d3c] text-[#f7f6f2]"
          >
            <IconComponent className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
