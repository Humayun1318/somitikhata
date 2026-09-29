import { User } from "lucide-react";

import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/get-initials";

const SIZES = {
  sm: { box: "h-9 w-9 text-sm", icon: "h-5 w-5" },
  md: { box: "h-11 w-11 text-base", icon: "h-5 w-5" },
  lg: { box: "h-16 w-16 text-xl sm:h-20 sm:w-20 sm:text-2xl", icon: "h-8 w-8" },
} as const;

type UserAvatarProps = {
  name?: string;
  size?: keyof typeof SIZES;
  className?: string;
};

// Initials circle. Falls back to a user icon when there is no name.
export function UserAvatar({ name = "", size = "sm", className }: UserAvatarProps) {
  const initials = getInitials(name);
  const styles = SIZES[size];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-full bg-app-primary/10 font-semibold text-app-primary",
        styles.box,
        className,
      )}
    >
      {initials || <User className={styles.icon} />}
    </span>
  );
}
