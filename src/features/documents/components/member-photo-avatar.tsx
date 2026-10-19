"use client";

import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/cn";

import { useDocumentImage } from "../hooks/use-document-image";
import type { DocumentOwner, StoredFileInfo } from "../types";

const BOX = { md: "h-11 w-11", lg: "h-16 w-16 sm:h-20 sm:w-20" } as const;

type MemberPhotoAvatarProps = {
  owner: DocumentOwner;
  photo?: StoredFileInfo;
  name: string;
  size: keyof typeof BOX;
  className?: string;
};

// The member's photo in a circle when one is uploaded, else the initials
// avatar. Also the initials while it can't be shown (the image failed to
// load), so a broken image never sits where the face should be.
export function MemberPhotoAvatar({ owner, photo, name, size, className }: MemberPhotoAvatarProps) {
  const image = useDocumentImage(owner, "photo", photo, "thumb");

  if (!photo || image.isError) return <UserAvatar name={name} size={size} className={className} />;

  return (
    <span
      className={cn(
        "block shrink-0 overflow-hidden rounded-full bg-app-surface-muted ring-2 ring-app-surface",
        BOX[size],
        className,
      )}
    >
      {image.data ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image.data} alt="" className="h-full w-full object-cover" />
      ) : (
        <span aria-busy="true" className="block h-full w-full animate-pulse bg-app-surface-muted" />
      )}
    </span>
  );
}
