import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { User, MapPin, Calendar } from "lucide-react";

interface UserAvatarProps {
  userId: string;
  name: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export default function UserAvatar({ userId, name, size = "sm", showTooltip = true }: UserAvatarProps) {
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

  // Mock user roles and locations for demonstration
  const getUserRole = (userId: string) => {
    const roles = {
      '1': 'Performance Analyst',
      '2': 'Sports Therapist', 
      '3': 'Head Coach',
      '4': 'Team Manager',
      '5': 'Nutrition Specialist'
    };
    return roles[userId as keyof typeof roles] || 'Team Member';
  };

  const getUserLocation = (userId: string) => {
    const locations = {
      '1': 'San Francisco, CA',
      '2': 'New York, NY',
      '3': 'Los Angeles, CA', 
      '4': 'Chicago, IL',
      '5': 'Austin, TX'
    };
    return locations[userId as keyof typeof locations] || 'Remote';
  };

  const avatar = (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`} />
      <AvatarFallback className="bg-primary/10 text-primary font-medium">
        {getInitials(name)}
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
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-semibold">{name}</h4>
            <p className="text-sm text-muted-foreground flex items-center">
              <User className="w-3 h-3 mr-1" />
              {getUserRole(userId)}
            </p>
            <p className="text-sm text-muted-foreground flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {getUserLocation(userId)}
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