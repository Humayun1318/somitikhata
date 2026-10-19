"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";

import { useToast } from "@/components/shared/toast/toast-provider";
import { Button } from "@/components/ui/button";
import { useMe } from "@/features/auth/hooks/use-me";
import { Link } from "@/i18n/navigation";

import { checkImageFile, getDocumentError } from "../document-errors";
import { useRemoveMyPhoto, useUploadMyPhoto } from "../hooks/use-document-mutations";
import { ALLOWED_IMAGE_TYPES } from "../types";

// Under the avatar on the profile page.
// Staff: upload / replace / remove their own photo (POST/DELETE /user/me/photo).
// Member: their avatar is the membership photo, changed on the Membership page.
export function MyPhotoControls({ isStaff }: { isStaff: boolean }) {
  const t = useTranslations("Documents");
  const toast = useToast();
  const { data: user } = useMe();
  const upload = useUploadMyPhoto();
  const remove = useRemoveMyPhoto();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const hasPhoto = !!user?.avatar;
  const isBusy = upload.isPending || remove.isPending;

  if (!isStaff) {
    return (
      <p className="text-xs text-app-text-muted">
        {t("memberPhotoHint")}{" "}
        <Link href="/member/membership" className="font-semibold text-app-primary hover:underline">
          {t("goToMembership")}
        </Link>
      </p>
    );
  }

  const onFileChosen = async (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = event.target.files?.[0];
    event.target.value = "";
    if (!chosen) return;
    const problem = checkImageFile(chosen, t);
    setError(problem);
    if (problem) return;
    try {
      await upload.mutateAsync(chosen);
      toast.success(t("uploadSuccess", { name: t("myPhoto") }));
    } catch (uploadError) {
      setError(getDocumentError(uploadError, t, "errors.generic"));
    }
  };

  const onRemove = async () => {
    setError(null);
    try {
      await remove.mutateAsync();
      toast.success(t("removeSuccess", { name: t("myPhoto") }));
    } catch (removeError) {
      setError(getDocumentError(removeError, t, "errors.removeGeneric"));
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => void onFileChosen(event)}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          isLoading={upload.isPending}
          disabled={isBusy}
          className="min-h-9 gap-1.5 px-3 text-xs"
        >
          {hasPhoto ? <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" /> : <ImagePlus aria-hidden="true" className="h-3.5 w-3.5" />}
          {upload.isPending ? t("uploading") : hasPhoto ? t("replace") : t("upload")}
        </Button>
        {hasPhoto && (
          <Button
            type="button"
            variant="outline"
            onClick={() => void onRemove()}
            isLoading={remove.isPending}
            disabled={isBusy}
            className="min-h-9 gap-1.5 px-3 text-xs hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
            {remove.isPending ? t("removing") : t("remove")}
          </Button>
        )}
      </div>
      <p className="text-xs text-app-text-muted">
        {t("myPhotoHint")} {t("rules")}
      </p>
      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
