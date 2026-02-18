import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const sizeClasses = {
  xs: "h-5 w-5 text-[10px]",
  sm: "h-7 w-7 text-xs",
  md: "h-10 w-10 text-sm",
} as const;

interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function UserAvatar({ name, image, size = "sm", className }: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {image && <AvatarImage src={image} alt={name} />}
      <AvatarFallback className={cn(sizeClasses[size], "bg-primary/10 text-primary font-medium")}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
