/**
 * Wipe.tsx
 *
 * Internal admin/debug route to wipe all app data for the current Puter user.
 *
 * Responsibilities:
 * - Ensure the user is authenticated (redirect to /auth if not).
 * - List all files in the root directory (`./`) of Puter FS.
 * - Provide a single button to:
 *    - Delete all listed files from Puter FS.
 *    - Flush all KV keys used by the app.
 *
 * ⚠️ This route is destructive:
 * - Intended for development / testing or a "Reset app" feature.
 * - After wiping, resumes and feedback will no longer be available.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const WipeApp = () => {
  const { auth, isLoading, error, clearError, fs, kv } = usePuterStore();
  const navigate = useNavigate();

  const [files, setFiles] = useState<FSItem[]>([]);

  /**
   * Load all files from the root directory in Puter FS.
   * This gives the user visibility into what will be deleted.
   */
  const loadFiles = async () => {
    const files = (await fs.readDir("./")) as FSItem[];
    setFiles(files || []);
  };

  // Initial load of files on mount
  useEffect(() => {
    loadFiles();
  }, [fs]);

  /**
   * Guard: if we finish loading and the user isn't authenticated,
   * redirect them to the auth page and send them back to /wipe after login.
   */
  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  /**
   * Deletes all files in the root directory and flushes KV storage.
   * After the operation, reloads the file list to reflect the cleared state.
   */
  const handleDelete = async () => {
    // Delete all files sequentially to avoid overwhelming the FS API.
    for (const file of files) {
      await fs.delete(file.path);
    }

    // Clear all KV keys (including resumes, feedback, etc.)
    await kv.flush();

    // Refresh the file list
    await loadFiles();
  };

  // Basic loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Basic error state
  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <p>
        Authenticated as: <strong>{auth.user?.username}</strong>
      </p>

      <div>
        <h2 className="text-lg font-semibold mb-2">Existing files:</h2>
        <div className="flex flex-col gap-2">
          {files.length === 0 ? (
            <p className="text-gray-500 text-sm">No files found in ./</p>
          ) : (
            files.map((file) => (
              <div key={file.id} className="flex flex-row gap-4 text-sm">
                <p>{file.name}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
          onClick={handleDelete}
        >
          Wipe App Data
        </button>
      </div>
    </div>
  );
};

export default WipeApp;
