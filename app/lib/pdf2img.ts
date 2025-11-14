/**
 * pdf2img.ts
 *
 * Utility for converting the first page of a PDF file into a high-resolution PNG image.
 *
 * Responsibilities:
 * - Lazy-load the PDF.js library only when needed (reduces bundle size).
 * - Render page 1 of a PDF at high scale using an offscreen canvas.
 * - Return both:
 *    - a browser-friendly `imageUrl` (via URL.createObjectURL)
 *    - a PNG `File` object (useful for uploading/storing)
 *
 * Used in:
 * - Resume upload flow (preview thumbnail)
 * - Any place where we need a visual snapshot of a PDF resume
 *
 * Limitations:
 * - Converts **only the first page** (because that's all we need in this app)
 * - Depends on `/pdf.worker.min.mjs` being present in public assets
 */

/**
 * Result object returned by `convertPdfToImage`.
 *
 * @property imageUrl - Blob URL pointing to the generated PNG preview.
 * @property file     - File object containing the PNG version of the first PDF page.
 * @property error    - Optional error message if conversion failed.
 */
export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

/**
 * Lazily loads the PDF.js library from `pdfjs-dist`.
 *
 * Behavior:
 * - Ensures the library is only loaded **once**.
 * - Sets the required PDF.js worker file (`/pdf.worker.min.mjs`).
 * - Caches the loaded instance for subsequent conversions.
 *
 * @returns The loaded PDF.js module.
 */
async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjsLib = lib;
    isLoading = false;
    return lib;
  });

  return loadPromise;
}

/**
 * Converts the **first page** of a PDF file into a PNG image.
 *
 * Steps:
 * 1. Loads PDF.js (lazy-loaded via `loadPdfJs()`).
 * 2. Reads PDF bytes via `file.arrayBuffer()`.
 * 3. Renders page 1 to a high-resolution canvas (`scale: 4`).
 * 4. Converts canvas to a PNG Blob.
 * 5. Wraps the blob into a File and creates an object URL for previews.
 *
 * @param file - A PDF file selected/uploaded by the user.
 *
 * @returns {PdfConversionResult}
 *   - `imageUrl` → browser preview URL (`blob:`)
 *   - `file`     → PNG image file (for uploads/storage)
 *   - `error`    → string when conversion fails
 *
 * Usage example:
 * ```ts
 * const result = await convertPdfToImage(pdfFile);
 * if (result.file) {
 *   console.log("PNG preview:", result.imageUrl);
 * }
 * ```
 */
export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 4 }); // High quality
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    }

    await page.render({ canvasContext: context!, viewport }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0
      );
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}
