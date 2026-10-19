"use client";

import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/cn";

import type { DocumentOwner, StoredFileInfo } from "../types";

import { DocumentImage } from "./document-image";

const BOX = { md: "h-11 w-11", lg: "h-16 w-16 sm:h-20 sm:w-20" } as const;

type MemberPhotoAvatarProps = {
  owner: DocumentOwner;
  photo?: StoredFileInfo;
  name: string;
  size: keyof typeof BOX;
  className?: string;
};

// The member's photo in a circle when one is uploaded, else the initials avatar.
export function MemberPhotoAvatar({ owner, photo, name, size, className }: MemberPhotoAvatarProps) {
  if (!photo) return <UserAvatar name={name} size={size} className={className} />;

  return (
    <span className={cn("block shrink-0 overflow-hidden rounded-full bg-app-surface-muted", BOX[size], className)}>
      <DocumentImage owner={owner} kind="photo" file={photo} size="thumb" alt="" className="object-cover" />
    </span>
  );
}
