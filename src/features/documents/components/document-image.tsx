"use client";

import { useTranslations } from "next-intl";
import { ImageOff, RotateCw } from "lucide-react";

import { cn } from "@/lib/cn";

import { useDocumentImage } from "../hooks/use-document-image";
import type { DocumentKind, DocumentOwner, ImageSize, StoredFileInfo } from "../types";

type DocumentImageProps = {
  owner: DocumentOwner;
  kind: DocumentKind;
  file: StoredFileInfo;
  size: ImageSize;
  alt: string;
  className?: string;
};

// One stored image: a pulse while it loads, a retry if it fails.
// Plain <img> (not next/image): the bytes come from our API as a data URL,
// already shrunk by Cloudinary, so there is nothing for next/image to optimize.
export function DocumentImage({ owner, kind, file, size, alt, className }: DocumentImageProps) {
  const t = useTranslations("Documents");
  const image = useDocumentImage(owner, kind, file, size);

  if (image.data) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image.data} alt={alt} className={cn("h-full w-full object-contain", className)} />;
  }

  if (image.isError) {
    return (
      <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-2 text-center text-xs text-red-700">
        <ImageOff aria-hidden="true" className="h-5 w-5" />
        {t("loadError")}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            void image.refetch();
          }}
          className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline"
        >
          <RotateCw aria-hidden="true" className="h-3 w-3" />
          {t("retry")}
        </button>
      </span>
    );
  }

  return <span aria-busy="true" className="block h-full w-full animate-pulse bg-app-surface-muted" />;
}
