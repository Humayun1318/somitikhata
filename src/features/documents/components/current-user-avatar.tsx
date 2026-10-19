"use client";

import { UserAvatar } from "@/components/shared/user-avatar";
import { useMe } from "@/features/auth/hooks/use-me";
import { cn } from "@/lib/cn";

import { useMyAvatar } from "../hooks/use-my-avatar";

// Same box sizes as UserAvatar
const BOX = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-16 w-16 sm:h-20 sm:w-20",
} as const;

type CurrentUserAvatarProps = {
  size: keyof typeof BOX;
  className?: string;
};

// The logged-in user's photo in a circle (staff: own photo, member: membership
// photo). Initials while it loads, when there is none, or if it can't load.
export function CurrentUserAvatar({ size, className }: CurrentUserAvatarProps) {
  const { data: user } = useMe();
  const avatar = useMyAvatar(user?.avatar?.version);
  const name = user?.name ?? "";

  if (!avatar.data) return <UserAvatar name={name} size={size} className={className} />;

  return (
    <span aria-hidden="true" className={cn("block shrink-0 overflow-hidden rounded-full bg-app-surface-muted", BOX[size], className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={avatar.data} alt="" className="h-full w-full object-cover" />
    </span>
  );
}
