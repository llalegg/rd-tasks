import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format role with proper capitalization
  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const userRole = user?.role ? formatRole(user.role) : 'Team Member';

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getProfileImage = (userId: string) => {
    const imageIds = {
      '1': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      '2': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      '3': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      '4': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      '5': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
      '6': 'https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=32&h=32&fit=crop&crop=face',
      '7': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&fit=crop&crop=face',
      '8': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face',
      '9': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face',
      '10': 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=32&h=32&fit=crop&crop=face',
      '11': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=32&h=32&fit=crop&crop=face',
      '12': 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=32&h=32&fit=crop&crop=face',
      '13': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face',
      '14': 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=32&h=32&fit=crop&crop=face',
      '15': 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=32&h=32&fit=crop&crop=face'
    };
    return imageIds[userId as keyof typeof imageIds] || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face`;
  };

  const handleChatClick = () => {
    // TODO: Implement chat functionality
    console.log('Chat with user:', displayName);
  };

  const handleMouseEnter = useCallback(() => {
    console.log('PortalTooltip: Mouse enter triggered for', displayName);
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setIsVisible(true);
    }
  }, [displayName]);

  const handleMouseLeave = useCallback(() => {
    // Add a small delay to allow moving to tooltip
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 150);
  }, []);

  const handleTooltipMouseEnter = useCallback(() => {
    // Clear timeout when entering tooltip
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(true);
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  const tooltip = isVisible && displayName ? (
    <div
      style={{
        position: 'fixed',
        left: Math.max(10, Math.min(window.innerWidth - 210, position.x - 100)), // Center the 200px tooltip with bounds
        top: Math.max(10, position.y - 120), // Position above the trigger with bounds
        zIndex: 999999, // High z-index but not maximum
        pointerEvents: 'auto', // Allow interaction with chat button
        fontFamily: 'Montserrat, sans-serif',
      }}
      className="bg-[#0d0d0c] border border-[#292928] rounded-lg px-3 py-2 pb-4 shadow-lg w-[200px] flex flex-col gap-2"
      onMouseEnter={handleTooltipMouseEnter}
      onMouseLeave={handleTooltipMouseLeave}
    >
      {/* Avatar Section */}
      <div className="flex gap-2 items-start py-1 h-12">
        <div 
          className="w-8 h-8 rounded-full bg-cover bg-center border border-black/70 flex-shrink-0"
          style={{
            backgroundImage: `url(${getProfileImage(userId)})`,
          }}
        />
        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
          <div 
            className="font-medium text-sm leading-[1.46] text-[#f7f6f2] whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ fontWeight: 500 }}
          >
            {displayName}
          </div>
          <div 
            className="font-normal text-xs leading-[1.32] text-[#979795] whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ fontWeight: 400 }}
          >
            {userRole}
          </div>
        </div>
      </div>
      
      {/* Chat Button */}
      <button 
        className="flex items-center justify-center gap-2 h-8 px-3 bg-[#292928] border-none rounded-full text-[#f7f6f2] font-medium text-xs leading-[1.32] cursor-pointer transition-colors hover:bg-[#3a3a38]"
        style={{ 
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 500,
        }}
        onClick={handleChatClick}
      >
        <div 
          className="w-4 h-4 bg-[#f7f6f2] flex-shrink-0"
          style={{
            mask: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='currentColor' stroke-width='1.5' fill='none' d='M18 10c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L1 19l1.395-3.72C1.512 14.042 1 12.091 1 10c0-4.418 4.03-8 9-8s9 3.582 9 8zM6 10h.01M10 10h.01M14 10h.01'/%3E%3C/svg%3E\") no-repeat center",
            maskSize: 'contain',
          }}
        />
        Chat
      </button>
    </div>
  ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer inline-block"
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      {tooltip && createPortal(tooltip, document.body)}
    </>
  );
}