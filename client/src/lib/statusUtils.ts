// Status configuration utilities
export const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
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

// Priority color utilities
export const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high': return '#f87171';
    case 'medium': return '#3f83f8';
    case 'low': return '#979795';
    default: return '#979795';
  }
};

// Status color utilities
export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'new': return '#ff8254';
    case 'in_progress': return '#3f83f8';
    case 'blocked': return '#f87171';
    case 'completed': return '#4ade80';
    default: return '#ff8254';
  }
};

// Date formatting utilities
export const formatDeadline = (deadline: string | Date | undefined) => {
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

// Task type formatting utilities
export const formatTaskType = (type: string | undefined) => {
  if (!type) return '';
  
  // Handle specific cases to replace "todo" with "task"
  if (type === 'generaltodo') return 'General Task';
  
  // Handle camelCase words by splitting on capital letters
  return type
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .replace(/\b\w/g, str => str.toUpperCase()) // Capitalize each word
    .replace(/\btodo\b/gi, 'Task'); // Replace "todo" with "Task" (case insensitive)
};

// Priority order for sorting
export const getPriorityOrder = (priority: string) => {
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return priorityOrder[priority?.toLowerCase() as keyof typeof priorityOrder] || 0;
};
