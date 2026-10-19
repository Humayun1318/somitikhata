import { STORED_MAX_SIDE } from "./types";

// A phone photo is often 4000 px and 3–6 MB, but the backend keeps at most
// STORED_MAX_SIDE px anyway. Shrinking it here first sends a fraction of the
// bytes (faster on mobile data, inside the server's request limits) and gives
// the same stored image. Keeps the file's type; drops EXIF (location) like the
// server does. Anything unexpected → the original file, unchanged.
export async function shrinkImageForUpload(file: File): Promise<File> {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") return file;

  try {
    const bitmap = await createImageBitmap(file); // applies the EXIF rotation
    const scale = STORED_MAX_SIDE / Math.max(bitmap.width, bitmap.height);
    if (scale >= 1) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, file.type, 0.9));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name, { type: blob.type || file.type, lastModified: Date.now() });
  } catch {
    return file;
  }
}
