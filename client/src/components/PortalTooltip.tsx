import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin, Calendar } from "lucide-react";

interface PortalTooltipProps {
  userId: string;
  user: any;
  displayName: string;
  children: React.ReactNode;
}

export function PortalTooltip({ userId, user, displayName, children }: PortalTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const userRole = user?.role || 'Team Member';
  const userLocation = user?.location || 'Location not set';

  const getProfileImage = (userId: string) => {
    const imageIds = {
      '1': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      '2': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      '3': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      '4': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      '5': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      '6': 'https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=150&h=150&fit=crop&crop=face',
      '7': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
      '8': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      '9': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      '10': 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face',
      '11': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
      '12': 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150&h=150&fit=crop&crop=face',
      '13': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      '14': 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
      '15': 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop&crop=face'
    };
    return imageIds[userId as keyof typeof imageIds] || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const tooltip = isVisible ? (
    <div
      style={{
        position: 'fixed',
        left: position.x - 160, // Center the 320px tooltip
        top: position.y - 120, // Position above the trigger
        zIndex: 2147483647, // Maximum z-index
        pointerEvents: 'none',
      }}
      className="w-80 p-4 bg-popover border rounded-md shadow-md"
    >
      <div className="flex justify-between space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage 
            src={getProfileImage(userId)} 
            alt={displayName}
          />
          <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1 flex-1">
          <h4 className="text-sm font-semibold">{displayName}</h4>
          <p className="text-sm text-muted-foreground flex items-center">
            <User className="w-3 h-3 mr-1" />
            {userRole}
          </p>
          <p className="text-sm text-muted-foreground flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {userLocation}
          </p>
          <p className="text-xs text-muted-foreground flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            Team member since 2023
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer"
      >
        {children}
      </div>
      {tooltip && createPortal(tooltip, document.body)}
    </>
  );
}