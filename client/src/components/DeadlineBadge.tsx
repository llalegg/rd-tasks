interface DeadlineBadgeProps {
  deadline: string | undefined;
  className?: string;
}

export default function DeadlineBadge({ deadline, className = "" }: DeadlineBadgeProps) {
  const getDeadlineClass = (dateString: string | undefined) => {
    if (!dateString) return 'deadline-empty';
    
    const today = new Date();
    const deadlineDate = new Date(dateString);
    
    if (isNaN(deadlineDate.getTime())) return 'deadline-empty';
    
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'deadline-overdue';  // Past due
    if (diffDays === 0) return 'deadline-overdue'; // Due today (critical)
    if (diffDays <= 2) return 'deadline-warning';  // Due soon
    return 'deadline-normal'; // Future
  };

  const formatDeadlineText = (dateString: string | undefined) => {
    if (!dateString) return '–';
    
    const today = new Date();
    const deadline = new Date(dateString);
    
    if (isNaN(deadline.getTime())) return '–';
    
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
    if (diffDays <= 7) return `${diffDays}d`;
    
    // Format as short date
    return deadline.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const deadlineClass = getDeadlineClass(deadline);
  const deadlineText = formatDeadlineText(deadline);

  const getDeadlineStyles = () => {
    switch (deadlineClass) {
      case 'deadline-overdue':
        return {
          backgroundColor: '#321a1a',
          color: '#f87171'
        };
      case 'deadline-warning':
        return {
          backgroundColor: '#302608',
          color: '#facc15'
        };
      case 'deadline-normal':
        return {
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          color: '#f7f6f2',
          backdropFilter: 'blur(20px)'
        };
      case 'deadline-empty':
      default:
        return {
          backgroundColor: 'transparent',
          color: '#979795'
        };
    }
  };

  const styles = getDeadlineStyles();

  return (
    <span 
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium h-5 ${className}`}
      style={styles}
    >
      {deadlineText}
    </span>
  );
}