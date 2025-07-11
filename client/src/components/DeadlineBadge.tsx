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
        return {
          style: {
            display: 'flex',
            padding: 'var(--2) var(--8-tags)',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--4-icon-text)',
            borderRadius: 'var(--rounded-full-button)',
            background: 'var(--fill-badge-red-muted)',
            color: 'var(--text-error-default)',
            textAlign: 'center' as const,
            fontFamily: 'Montserrat',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '132%',
            border: 'none',
            width: 'fit-content'
          },
          className: ''
        };
      case 'yellow':
        return {
          style: {
            display: 'flex',
            padding: 'var(--2) var(--8-tags)',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--4-icon-text)',
            borderRadius: 'var(--rounded-full-button)',
            background: 'var(--fill-badge-yellow-muted)',
            color: 'var(--yellow-500)',
            textAlign: 'center' as const,
            fontFamily: 'Montserrat',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '132%',
            border: 'none',
            width: 'fit-content'
          },
          className: ''
        };
      case 'green':
        return {
          style: {
            display: 'flex',
            padding: 'var(--2) var(--8-tags)',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--4-icon-text)',
            borderRadius: 'var(--rounded-full-button)',
            background: 'var(--alpha-2a-press-selected)',
            backdropFilter: 'blur(20px)',
            color: 'var(--text-base-secondary)',
            textAlign: 'center' as const,
            fontFamily: 'Montserrat',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '132%',
            border: 'none',
            width: 'fit-content'
          },
          className: ''
        };
      default:
        return { style: {}, className: '' };
    }
  };

  const customStyle = getCustomStyle();

  return (
    <Badge 
      variant={badgeInfo.variant}
      className={`${customStyle.className} ${className}`}
      style={customStyle.style}
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