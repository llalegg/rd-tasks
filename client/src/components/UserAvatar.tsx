import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { User, MapPin, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { User as UserType } from "@shared/schema";

interface UserAvatarProps {
  userId: string;
  name?: string;
  size?: "sm" | "md" | "lg";
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
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm", 
    lg: "h-10 w-10 text-base"
  };

  // Use provided name or fallback to user data
  const displayName = name || user?.name || 'Unknown User';
  const userRole = user?.role || 'Team Member';
  const userLocation = user?.location || 'Location not set';

  const avatar = (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`} />
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
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`} />
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