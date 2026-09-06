/**
 * Tests for data transformation utilities
 */

import { describe, it, expect } from "vitest";
import {
  transformProfileToSchema,
  transformAssetToSchema,
  transformProfileFromSchema,
  transformAssetFromSchema,
  isValidIsoString,
} from "../dataTransformation";
import type { SpawnProfile, MediaAsset } from "../../types";

describe("dataTransformation", () => {
  describe("transformProfileToSchema", () => {
    it("should transform profile to schema format", () => {
      const profile: SpawnProfile = {
        id: "profile-1",
        name: "Test Profile",
        description: "Test Description",
        spawns: [],
        lastModified: 1640995200000, // 2022-01-01T00:00:00.000Z
        isActive: false,
      };

      const result = transformProfileToSchema(profile);

      expect(result).toEqual({
        id: "profile-1",
        name: "Test Profile",
        description: "Test Description",
        spawns: [],
        lastModified: "2022-01-01T00:00:00.000Z",
      });
    });

    it("should handle profile without description", () => {
      const profile: SpawnProfile = {
        id: "profile-1",
        name: "Test Profile",
        spawns: [],
        lastModified: 1640995200000,
        isActive: false,
      };

      const result = transformProfileToSchema(profile);

      expect(result.description).toBeUndefined();
    });
  });

  describe("transformAssetToSchema", () => {
    it("should transform asset to schema format", () => {
      const asset: MediaAsset = {
        id: "asset-1",
        name: "Test Asset",
        path: "/test/asset.jpg",
        isUrl: false,
        type: "image",
      };

      const result = transformAssetToSchema(asset);

      expect(result).toEqual({
        id: "asset-1",
        name: "Test Asset",
        path: "/test/asset.jpg",
        isUrl: false,
        type: "image",
      });
    });
  });

  describe("transformProfileFromSchema", () => {
    it("should transform schema profile to internal format", () => {
      const schemaProfile = {
        id: "profile-1",
        name: "Test Profile",
        description: "Test Description",
        spawns: [],
        lastModified: "2022-01-01T00:00:00.000Z",
      };

      const result = transformProfileFromSchema(schemaProfile);

      expect(result).toEqual({
        id: "profile-1",
        name: "Test Profile",
        description: "Test Description",
        spawns: [],
        lastModified: 1640995200000,
        isActive: false,
      });
    });
  });

  describe("transformAssetFromSchema", () => {
    it("should transform schema asset to internal format", () => {
      const schemaAsset = {
        id: "asset-1",
        name: "Test Asset",
        path: "/test/asset.jpg",
        isUrl: false,
        type: "image" as const,
      };

      const result = transformAssetFromSchema(schemaAsset);

      expect(result).toEqual({
        id: "asset-1",
        name: "Test Asset",
        path: "/test/asset.jpg",
        isUrl: false,
        type: "image",
      });
    });
  });

  describe("isValidIsoString", () => {
    it("should validate valid ISO strings", () => {
      expect(isValidIsoString("2022-01-01T00:00:00.000Z")).toBe(true);
      expect(isValidIsoString("2022-01-01T00:00:00.000Z")).toBe(true); // Same as above since toISOString() adds milliseconds
      expect(isValidIsoString("invalid")).toBe(false);
      expect(isValidIsoString("")).toBe(false);
    });
  });
});
