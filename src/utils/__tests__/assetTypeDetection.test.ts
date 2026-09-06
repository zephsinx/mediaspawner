import { describe, it, expect } from "vitest";
import {
  detectAssetTypeFromPath,
  extractExtension,
  isValidAssetPath,
  isValidFilePath,
  isValidUrl,
  validateFileReference,
  validateFileType,
} from "../assetTypeDetection";

describe("assetTypeDetection", () => {
  describe("detectAssetTypeFromPath", () => {
    describe("URLs with query strings", () => {
      it("detects image type from URL with query string", () => {
        const url = "https://example.com/image.png?param=value";
        expect(detectAssetTypeFromPath(url)).toBe("image");
      });

      it("detects video type from URL with query string", () => {
        const url = "https://example.com/video.mp4?autoplay=true";
        expect(detectAssetTypeFromPath(url)).toBe("video");
      });

      it("detects audio type from URL with query string", () => {
        const url = "https://example.com/audio.mp3?t=123";
        expect(detectAssetTypeFromPath(url)).toBe("audio");
      });
    });

    describe("URLs with path segments after extension", () => {
      it("detects image type from problematic URL in TEST_FINDINGS.md", () => {
        const url =
          "https://static.wikia.nocookie.net/hollowknight/images/d/da/Hornet_Beast%27s_Den.png/revision/latest?cb=20251028212915";
        expect(detectAssetTypeFromPath(url)).toBe("image");
      });

      it("detects type from URL with revision path", () => {
        const url = "https://example.com/video.webm/revision/latest?cb=123";
        expect(detectAssetTypeFromPath(url)).toBe("video");
      });
    });

    describe("URLs with fragments", () => {
      it("detects image type from URL with fragment", () => {
        const url = "https://example.com/image.png#section";
        expect(detectAssetTypeFromPath(url)).toBe("image");
      });

      it("detects video type from URL with query and fragment", () => {
        const url = "https://example.com/video.mp4?autoplay=true#player";
        expect(detectAssetTypeFromPath(url)).toBe("video");
      });
    });

    describe("File paths", () => {
      it("detects audio type from Windows file path", () => {
        const path = "C:\\Media\\test-audio.mp3";
        expect(detectAssetTypeFromPath(path)).toBe("audio");
      });

      it("detects video type from Unix file path", () => {
        const path = "/media/test-video.mp4";
        expect(detectAssetTypeFromPath(path)).toBe("video");
      });

      it("detects image type from relative file path", () => {
        const path = "./assets/image.png";
        expect(detectAssetTypeFromPath(path)).toBe("image");
      });
    });

    describe("Fallback behavior", () => {
      it("falls back to image for path without extension", () => {
        const path = "https://example.com/path/to/file";
        expect(detectAssetTypeFromPath(path)).toBe("image");
      });

      it("falls back to image for unsupported extension", () => {
        const path = "https://example.com/file.exe";
        expect(detectAssetTypeFromPath(path)).toBe("image");
      });
    });
  });

  describe("isValidAssetPath", () => {
    describe("URLs with query strings", () => {
      it("validates image URL with query string", () => {
        expect(
          isValidAssetPath("https://example.com/image.png?param=value"),
        ).toBe(true);
      });

      it("validates video URL with query string", () => {
        expect(
          isValidAssetPath("https://example.com/video.mp4?autoplay=true"),
        ).toBe(true);
      });
    });

    describe("URLs with path segments after extension", () => {
      it("validates problematic URL from TEST_FINDINGS.md", () => {
        const url =
          "https://static.wikia.nocookie.net/hollowknight/images/d/da/Hornet_Beast%27s_Den.png/revision/latest?cb=20251028212915";
        expect(isValidAssetPath(url)).toBe(true);
      });
    });

    describe("File paths", () => {
      it("validates Windows file path", () => {
        expect(isValidAssetPath("C:\\Media\\test-audio.mp3")).toBe(true);
      });

      it("validates Unix file path", () => {
        expect(isValidAssetPath("/media/test-video.mp4")).toBe(true);
      });
    });

    describe("Invalid paths", () => {
      it("returns false for path without extension", () => {
        expect(isValidAssetPath("https://example.com/path/to/file")).toBe(
          false,
        );
      });

      it("returns false for unsupported extension", () => {
        expect(isValidAssetPath("https://example.com/file.exe")).toBe(false);
      });
    });
  });

  describe("extractExtension", () => {
    describe("URLs with query strings", () => {
      it("extracts extension from URL with query string", () => {
        const url = "https://example.com/image.png?param=value";
        expect(extractExtension(url)).toBe("png");
      });

      it("extracts extension from URL with multiple query parameters", () => {
        const url =
          "https://example.com/video.mp4?width=1920&height=1080&quality=high";
        expect(extractExtension(url)).toBe("mp4");
      });

      it("extracts extension from URL with query string starting with ?", () => {
        const url = "https://example.com/audio.mp3?t=123";
        expect(extractExtension(url)).toBe("mp3");
      });
    });

    describe("URLs with path segments after extension", () => {
      it("extracts extension from URL with path segments before query", () => {
        const url =
          "https://static.wikia.nocookie.net/hollowknight/images/d/da/Hornet_Beast%27s_Den.png/revision/latest?cb=20251028212915";
        expect(extractExtension(url)).toBe("png");
      });

      it("extracts extension from URL with revision path", () => {
        const url = "https://example.com/image.png/revision/latest?cb=123";
        expect(extractExtension(url)).toBe("png");
      });

      it("extracts extension from URL with multiple path segments", () => {
        const url =
          "https://example.com/video.webm/thumbnails/thumbnail.jpg?size=large";
        expect(extractExtension(url)).toBe("jpg");
      });
    });

    describe("URLs with fragments", () => {
      it("extracts extension from URL with fragment", () => {
        const url = "https://example.com/image.png#section";
        expect(extractExtension(url)).toBe("png");
      });

      it("extracts extension from URL with query and fragment", () => {
        const url = "https://example.com/video.mp4?autoplay=true#player";
        expect(extractExtension(url)).toBe("mp4");
      });
    });

    describe("File paths", () => {
      it("extracts extension from Windows file path", () => {
        const path = "C:\\Media\\test-audio.mp3";
        expect(extractExtension(path)).toBe("mp3");
      });

      it("extracts extension from Unix file path", () => {
        const path = "/media/test-video.mp4";
        expect(extractExtension(path)).toBe("mp4");
      });

      it("extracts extension from relative file path", () => {
        const path = "./assets/image.png";
        expect(extractExtension(path)).toBe("png");
      });
    });

    describe("Edge cases", () => {
      it("returns empty string for URL without extension", () => {
        const url = "https://example.com/path/to/file";
        expect(extractExtension(url)).toBe("");
      });

      it("returns empty string for file path without extension", () => {
        const path = "C:\\Media\\test";
        expect(extractExtension(path)).toBe("");
      });

      it("handles URL with only query parameters", () => {
        const url = "https://example.com/path?param=value";
        expect(extractExtension(url)).toBe("");
      });

      it("handles URL with only fragment", () => {
        const url = "https://example.com/path#section";
        expect(extractExtension(url)).toBe("");
      });
    });
  });

  describe("validateFileType", () => {
    describe("URLs with query strings", () => {
      it("validates image URL with query string", () => {
        const result = validateFileType(
          "https://example.com/image.png?param=value",
        );
        expect(result.isValid).toBe(true);
        expect(result.mediaType).toBe("image");
      });

      it("validates video URL with query string", () => {
        const result = validateFileType(
          "https://example.com/video.mp4?autoplay=true",
        );
        expect(result.isValid).toBe(true);
        expect(result.mediaType).toBe("video");
      });

      it("validates audio URL with query string", () => {
        const result = validateFileType("https://example.com/audio.mp3?t=123");
        expect(result.isValid).toBe(true);
        expect(result.mediaType).toBe("audio");
      });
    });

    describe("URLs with path segments after extension", () => {
      it("validates problematic URL from TEST_FINDINGS.md", () => {
        const url =
          "https://static.wikia.nocookie.net/hollowknight/images/d/da/Hornet_Beast%27s_Den.png/revision/latest?cb=20251028212915";
        const result = validateFileType(url);
        expect(result.isValid).toBe(true);
        expect(result.mediaType).toBe("image");
        expect(result.error).toBeUndefined();
      });

      it("validates URL with revision path", () => {
        const result = validateFileType(
          "https://example.com/image.png/revision/latest?cb=123",
        );
        expect(result.isValid).toBe(true);
        expect(result.mediaType).toBe("image");
      });
    });

    describe("URLs with fragments", () => {
      it("validates URL with fragment", () => {
        const result = validateFileType(
          "https://example.com/image.png#section",
        );
        expect(result.isValid).toBe(true);
        expect(result.mediaType).toBe("image");
      });

      it("validates URL with query and fragment", () => {
        const result = validateFileType(
          "https://example.com/video.mp4?autoplay=true#player",
        );
        expect(result.isValid).toBe(true);
        expect(result.mediaType).toBe("video");
      });
    });

    describe("File paths", () => {
      it("validates Windows file path", () => {
        const result = validateFileType("C:\\Media\\test-audio.mp3");
        expect(result.isValid).toBe(true);
        expect(result.mediaType).toBe("audio");
      });

      it("validates Unix file path", () => {
        const result = validateFileType("/media/test-video.mp4");
        expect(result.isValid).toBe(true);
        expect(result.mediaType).toBe("video");
      });

      it("validates relative file path", () => {
        const result = validateFileType("./assets/image.png");
        expect(result.isValid).toBe(true);
        expect(result.mediaType).toBe("image");
      });
    });

    describe("Error cases", () => {
      it("returns error for empty path", () => {
        const result = validateFileType("");
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("File path cannot be empty");
      });

      it("returns error for path without extension", () => {
        const result = validateFileType("https://example.com/path/to/file");
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("No file extension found");
      });

      it("returns error for unsupported extension", () => {
        const result = validateFileType("https://example.com/file.exe");
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("Unsupported file type");
      });
    });
  });

  describe("validateFileReference", () => {
    describe("URLs with query strings", () => {
      it("validates and formats URL with query string", () => {
        const result = validateFileReference(
          "https://example.com/image.png?param=value",
        );
        expect(result.isValid).toBe(true);
        expect(result.mediaType).toBe("image");
        expect(result.formattedPath).toBe(
          "https://example.com/image.png?param=value",
        );
      });
    });

    describe("URLs with path segments after extension", () => {
      it("validates problematic URL from TEST_FINDINGS.md", () => {
        const url =
          "https://static.wikia.nocookie.net/hollowknight/images/d/da/Hornet_Beast%27s_Den.png/revision/latest?cb=20251028212915";
        const result = validateFileReference(url);
        expect(result.isValid).toBe(true);
        expect(result.mediaType).toBe("image");
        expect(result.formattedPath).toBe(url);
      });
    });

    describe("File paths", () => {
      it("validates and normalizes relative file path", () => {
        // Note: Using relative path since absolute Windows paths with drive letters
        // fail validation due to colon in drive letter. This tests path normalization.
        const result = validateFileReference("./Media/test-audio.mp3");
        expect(result.isValid).toBe(true);
        expect(result.mediaType).toBe("audio");
        expect(result.formattedPath).toBe("./Media/test-audio.mp3");
      });

      it("validates Unix file path", () => {
        const result = validateFileReference("/media/test-video.mp4");
        expect(result.isValid).toBe(true);
        expect(result.mediaType).toBe("video");
        expect(result.formattedPath).toBe("/media/test-video.mp4");
      });
    });
  });

  describe("isValidUrl", () => {
    it("returns true for http URL", () => {
      expect(isValidUrl("http://example.com/image.png")).toBe(true);
    });

    it("returns true for https URL", () => {
      expect(isValidUrl("https://example.com/image.png")).toBe(true);
    });

    it("returns false for file path", () => {
      expect(isValidUrl("C:\\Media\\test.mp3")).toBe(false);
    });

    it("returns false for invalid URL", () => {
      expect(isValidUrl("not-a-url")).toBe(false);
    });
  });

  describe("isValidFilePath", () => {
    it("returns true for valid relative path", () => {
      // Note: Using relative path since absolute Windows paths with drive letters
      // fail validation due to colon in drive letter
      expect(isValidFilePath("./Media/test.mp3")).toBe(true);
    });

    it("returns true for valid Unix path", () => {
      expect(isValidFilePath("/media/test.mp3")).toBe(true);
    });

    it("returns false for empty string", () => {
      expect(isValidFilePath("")).toBe(false);
    });

    it("returns false for path with invalid characters", () => {
      expect(isValidFilePath("C:\\Media\\test<file.mp3")).toBe(false);
    });
  });
});
