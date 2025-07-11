import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { User, MapPin, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { User as UserType } from "@shared/schema";

interface UserAvatarProps {
  userId: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export default function UserAvatar({ userId, name, size = "sm", showTooltip = true }: UserAvatarProps) {
  // Fetch user data from API
  const { data: user } = useQuery({
    queryKey: ['/api/users', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(res => res.json()),
    enabled: !!userId,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm", 
    lg: "h-12 w-12 text-base"
  };

  // Use provided name or fallback to user data
  const displayName = name || user?.name || 'Unknown User';
  const userRole = user?.role || 'Team Member';
  const userLocation = user?.location || 'Location not set';

  // Generate consistent Unsplash photos based on user ID
  const getProfileImage = (userId: string) => {
    const imageIds = {
      '1': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      '2': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      '3': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      '4': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      '5': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    };
    return imageIds[userId as keyof typeof imageIds] || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face`;
  };

  const avatar = (
    <Avatar className={`${sizeClasses[size]} border-2 border-white/20`}>
      <AvatarImage 
        src={getProfileImage(userId)} 
        alt={displayName}
        onError={(e) => {
          // Fallback to initials if image fails to load
          e.currentTarget.style.display = 'none';
        }}
      />
      <AvatarFallback className="bg-primary/10 text-primary font-medium">
        {getInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );

  if (!showTooltip) {
    return avatar;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="cursor-pointer">
          {avatar}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="top">
        <div className="flex justify-between space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={getProfileImage(userId)} 
              alt={displayName}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
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
      </HoverCardContent>
    </HoverCard>
  );
}