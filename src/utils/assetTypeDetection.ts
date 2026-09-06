import type { MediaAsset } from "../types/media";

/**
 * File extension mappings for different asset types
 */
const ASSET_TYPE_EXTENSIONS = {
  image: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "svg",
    "ico",
    "tiff",
    "tif",
  ],
  video: [
    "mp4",
    "webm",
    "mov",
    "avi",
    "mkv",
    "flv",
    "wmv",
    "m4v",
    "3gp",
    "ogv",
  ],
  audio: ["mp3", "wav", "ogg", "m4a", "aac", "flac", "wma", "opus", "m4r"],
} as const;

export type MediaType = keyof typeof ASSET_TYPE_EXTENSIONS;

export interface FileValidationResult {
  isValid: boolean;
  mediaType?: MediaType;
  error?: string;
}

export function extractExtension(path: string): string {
  try {
    const url = new URL(path);
    if (url.protocol === "http:" || url.protocol === "https:") {
      const pathname = url.pathname;
      const lastDot = pathname.lastIndexOf(".");
      if (lastDot !== -1) {
        const afterDot = pathname.substring(lastDot + 1);
        const slashIndex = afterDot.indexOf("/");
        if (slashIndex !== -1) {
          return afterDot.substring(0, slashIndex).toLowerCase();
        }
        return afterDot.toLowerCase();
      }
    }
  } catch {
    // continue to file path logic on error
  }

  const cleanPath = path.split("?")[0].split("#")[0];

  const lastDot = cleanPath.lastIndexOf(".");
  const lastSlash = Math.max(
    cleanPath.lastIndexOf("/"),
    cleanPath.lastIndexOf("\\"),
  );

  if (lastDot > lastSlash && lastDot !== -1) {
    return cleanPath.slice(lastDot + 1).toLowerCase();
  }
  return "";
}

/**
 * Detect asset type from file path based on extension
 */
export function detectAssetTypeFromPath(path: string): MediaAsset["type"] {
  const extension = extractExtension(path);

  if ((ASSET_TYPE_EXTENSIONS.image as readonly string[]).includes(extension)) {
    return "image";
  }
  if ((ASSET_TYPE_EXTENSIONS.video as readonly string[]).includes(extension)) {
    return "video";
  }
  if ((ASSET_TYPE_EXTENSIONS.audio as readonly string[]).includes(extension)) {
    return "audio";
  }

  // Default fallback to image
  return "image";
}

/**
 * Get all supported file extensions for a specific asset type or all types
 */
export function getSupportedExtensions(type?: MediaAsset["type"]): string[] {
  if (type) {
    return [...ASSET_TYPE_EXTENSIONS[type]];
  }

  return Object.values(ASSET_TYPE_EXTENSIONS).flat();
}

/**
 * Check if a file path has a supported extension
 */
export function isValidAssetPath(path: string): boolean {
  const extension = extractExtension(path);
  return getSupportedExtensions().includes(extension);
}

/**
 * Determine the media type based on file extension
 */
export function getMediaTypeFromExtension(extension: string): MediaType | null {
  const lowerExt = extension.toLowerCase();
  for (const [mediaType, extensions] of Object.entries(ASSET_TYPE_EXTENSIONS)) {
    if ((extensions as readonly string[]).includes(lowerExt)) {
      return mediaType as MediaType;
    }
  }
  return null;
}

/**
 * Validate if a file path or URL has a supported file type
 */
export function validateFileType(filePath: string): FileValidationResult {
  if (!filePath.trim()) {
    return { isValid: false, error: "File path cannot be empty" };
  }

  const extension = extractExtension(filePath);
  if (!extension) {
    return { isValid: false, error: "No file extension found" };
  }

  const mediaType = getMediaTypeFromExtension(extension);
  if (!mediaType) {
    const supportedExts = Object.values(ASSET_TYPE_EXTENSIONS)
      .flat()
      .join(", ");
    return {
      isValid: false,
      error: `Unsupported file type. Supported extensions: ${supportedExts}`,
    };
  }

  return { isValid: true, mediaType };
}

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid file path (basic validation)
 */
export function isValidFilePath(string: string): boolean {
  if (!string.trim()) return false;

  // Check for invalid characters that are not allowed in file paths
  const invalidChars = /[<>"|?*]/;
  if (invalidChars.test(string)) return false;

  // Colon is only allowed as second character for drive letters (C:)
  const colonIndex = string.indexOf(":");
  if (colonIndex !== -1 && colonIndex !== 1) return false;

  return true;
}

/**
 * Validate and format a file reference (path or URL)
 */
export function validateFileReference(
  input: string,
): FileValidationResult & { formattedPath?: string } {
  const trimmed = input.trim();

  if (!trimmed) {
    return { isValid: false, error: "File reference cannot be empty" };
  }

  // Check if it's a URL
  if (isValidUrl(trimmed)) {
    const fileValidation = validateFileType(trimmed);
    return {
      ...fileValidation,
      formattedPath: trimmed,
    };
  }

  // Check if it's a file path
  if (isValidFilePath(trimmed)) {
    const fileValidation = validateFileType(trimmed);
    return {
      ...fileValidation,
      formattedPath: trimmed.replace(/\\/g, "/"), // Normalize path separators
    };
  }

  return { isValid: false, error: "Invalid file path or URL format" };
}
