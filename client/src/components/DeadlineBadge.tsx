import { Badge } from "@/components/ui/badge";
import { getDeadlineBadge } from "@/lib/dateUtils";

interface DeadlineBadgeProps {
  deadline: string | undefined;
  className?: string;
}

export default function DeadlineBadge({ deadline, className = "" }: DeadlineBadgeProps) {
  const badgeInfo = getDeadlineBadge(deadline);
  
  if (!badgeInfo) {
    return <span className={`text-muted-foreground ${className}`}>No deadline</span>;
  }

  const getCustomStyle = () => {
    switch (badgeInfo.color) {
      case 'red':
        return 'bg-red-600 hover:bg-red-700 text-white border-red-600';
      case 'yellow':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600';
      case 'green':
        return 'bg-green-600 hover:bg-green-700 text-white border-green-600';
      default:
        return '';
    }
  };

  return (
    <Badge 
      variant={badgeInfo.variant}
      className={`${getCustomStyle()} ${className}`}
      title={deadline ? new Date(deadline).toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : undefined}
    >
      {badgeInfo.label}
    </Badge>
  );
}