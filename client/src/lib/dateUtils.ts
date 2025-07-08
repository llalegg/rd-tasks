export interface DeadlineBadge {
  label: string;
  variant: 'destructive' | 'default' | 'secondary';
  color: 'red' | 'yellow' | 'green';
}

export function getDeadlineBadge(deadline: string | undefined): DeadlineBadge | null {
  if (!deadline) return null;

  const today = new Date();
  const deadlineDate = new Date(deadline);
  
  // Reset time to compare only dates
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      label: 'Today',
      variant: 'destructive',
      color: 'red'
    };
  }
  
  if (diffDays === -1) {
    return {
      label: 'Yesterday',
      variant: 'destructive',
      color: 'red'
    };
  }
  
  if (diffDays === 1) {
    return {
      label: 'Tomorrow',
      variant: 'default',
      color: 'yellow'
    };
  }
  
  if (diffDays === 2) {
    return {
      label: 'In 2 days',
      variant: 'default',
      color: 'yellow'
    };
  }
  
  if (diffDays === 3) {
    return {
      label: 'In 3 days',
      variant: 'default',
      color: 'yellow'
    };
  }
  
  if (diffDays >= 4) {
    return {
      label: deadlineDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      variant: 'secondary',
      color: 'green'
    };
  }
  
  // Past dates (2+ days ago)
  if (diffDays <= -2) {
    return {
      label: deadlineDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      variant: 'destructive',
      color: 'red'
    };
  }

  return null;
}