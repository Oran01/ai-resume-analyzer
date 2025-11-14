/**
 * utils.ts
 *
 * Collection of small utility helpers used across the application.
 * These functions are UI-focused and help with:
 * - merging conditional Tailwind class names
 * - formatting file sizes into human-readable strings
 * - generating unique IDs (for resumes, uploads, etc.)
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * `cn` (class names)
 *
 * Merges conditional class names while avoiding Tailwind CSS conflicts.
 * - `clsx` handles conditional logic (true/false, arrays, objects)
 * - `twMerge` resolves Tailwind merge conflicts (e.g., `p-2` vs `p-4`)
 *
 * @example
 * cn("p-4", condition && "bg-blue-500", "text-white")
 *
 * @param inputs - Any combination of strings, arrays, or objects
 * @returns A single merged className string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a byte size into a human-readable format such as:
 * - "512 Bytes"
 * - "1.25 MB"
 * - "3.4 GB"
 *
 * @example
 * formatSize(1024) → "1 KB"
 *
 * @param bytes - Raw size in bytes
 * @returns A formatted size string with appropriate unit
 */
export function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  // Determine the appropriate unit by calculating the log
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Format with 2 decimal places and round
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Generates a cryptographically secure UUID.
 * Used for identifying resumes, uploads, temporary items, etc.
 *
 * @example
 * const id = generateUUID(); // "e3f2b8d4-..."
 *
 * @returns A unique UUID string (v4)
 */
export const generateUUID = () => crypto.randomUUID();
