/**
 * FileUploader.tsx
 *
 * A drag-and-drop file uploader used for selecting a resume PDF.
 *
 * Features:
 * - Supports click-to-upload and drag-and-drop.
 * - Only accepts PDF files (max size: 20MB).
 * - Displays selected file name + size.
 * - Allows clearing the selected file.
 *
 * Props:
 * - `onFileSelect` (optional): Callback triggered when a file is selected
 *   or cleared. Receives either the selected File or `null`.
 *
 * Uses:
 * - `react-dropzone` for drag-and-drop handling.
 * - `formatSize()` from utils for readable file sizes.
 *
 * Typical usage:
 * ```tsx
 * <FileUploader onFileSelect={(file) => setSelectedFile(file)} />
 * ```
 */

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "~/lib/utils";

interface FileUploaderProps {
  /** Called when a file is selected or removed */
  onFileSelect?: (file: File | null) => void;
}
const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  /**
   * Handles the drop event triggered by react-dropzone.
   * Extracts the first file and emits it through the callback.
   */
  const onDrop = useCallback(
    (acceptedFile: File[]) => {
      const file = acceptedFile[0] || null;

      onFileSelect?.(file);
    },
    [onFileSelect]
  );

  // Maximum allowed file size: 20MB
  const maxFileSize = 20 * 1024 * 1024;

  // Dropzone config
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      multiple: false,
      accept: { "application/pdf": [".pdf"] },
      maxSize: maxFileSize,
    });

  // Extract the current selected file (if any)
  const file = acceptedFiles[0] || null;

  return (
    <div className="w-full gradient-border">
      {/* Wrapper for click & drag behavior */}
      <div {...getRootProps()}>
        <input {...getInputProps()} />

        <div className="space-y-4 cursor-pointer">
          {file ? (
            // -------------------------
            // Selected File View
            // -------------------------
            <div
              className="uploader-selected-file"
              onClick={(e) => e.stopPropagation()} // Prevent opening dialog when clicking inside
            >
              <img src="/images/pdf.png" alt="pdf" className="size-10" />
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>

              {/* Remove file button */}
              <button
                className="p-2 cursor-pointer"
                onClick={(e) => {
                  onFileSelect?.(null);
                }}
              >
                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
              </button>
            </div>
          ) : (
            // -------------------------
            // Empty State (no file selected)
            // -------------------------
            <div>
              <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                <img src="/icons/info.svg" alt="upload" className="size-20" />
              </div>
              <p className="text-lg text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-lg text-gray-500">
                PDF (max {formatSize(maxFileSize)})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
